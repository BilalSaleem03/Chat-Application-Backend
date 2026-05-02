import { Group, Conversation } from '../models/chat.model.js';
import { User }                from '../models/user.model.js';
import { UnreadCount }         from '../models/message.model.js';

// ── Create Contact ────────────────────────────────────────────
export const createContact = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No user found with this email. Ask them to register first.' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ error: 'You cannot add yourself as a contact.' });

    const existing = await Conversation.findOne({ isGroup: false, participants: { $all: [req.user.id, user._id] } });
    if (existing) return res.status(400).json({ error: 'You already have a conversation with this user.' });

    const conversation = await Conversation.create({ participants: [req.user.id, user._id], isGroup: false, image: req.file?.path || null });
    const populated = await Conversation.findById(conversation._id).populate('participants', 'name username email image');
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── Create Group ──────────────────────────────────────────────
export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    let members = req.body.members;
    if (!members) return res.status(400).json({ error: 'At least one member is required.' });
    if (!Array.isArray(members)) members = [members];
    members = members.filter(m => m && m.toString().trim());
    if (!name?.trim()) return res.status(400).json({ error: 'Group name is required.' });
    if (members.includes(req.user.id)) return res.status(400).json({ error: 'You cannot add yourself — you are added automatically as admin.' });

    const uniqueMembers = [...new Set([...members, req.user.id])];
    const existingGroup = await Group.findOne({ name: name.trim(), admin: req.user.id });
    if (existingGroup) return res.status(400).json({ error: 'You already have a group with this name.' });

    const newGroup = await Group.create({ name: name.trim(), description: description?.trim() || '', members: uniqueMembers, admin: req.user.id, image: req.file?.path || null });
    await Conversation.create({ groupDetails: newGroup._id, isGroup: true });
    res.status(201).json(newGroup);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── Get All Conversations (with unread counts) ────────────────
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const directConvs = await Conversation.find({ isGroup: false, participants: userId })
      .populate('participants', 'name username email image');

    const userGroups = await Group.find({ members: userId });
    const groupIds   = userGroups.map(g => g._id);

    const groupConvs = await Conversation.find({ isGroup: true, groupDetails: { $in: groupIds } })
      .populate({ path: 'groupDetails', populate: { path: 'members admin', select: 'name username email' } });

    // Fetch all unread counts for this user in one query
    const allConvIds = [
      ...directConvs.map(c => c._id),
      ...groupConvs.map(c => c._id),
    ];
    const unreadDocs = await UnreadCount.find({ userId, conversationId: { $in: allConvIds } });
    const unreadMap  = {};
    unreadDocs.forEach(u => { unreadMap[u.conversationId.toString()] = u.count; });

    const result = [
      // Direct conversations — isGroup always false
      ...directConvs
        .filter(conv => !conv.isGroup)   // extra safety filter
        .map(conv => {
          const other = conv.participants.find(p => p._id.toString() !== userId);
          return {
            conversationId: conv._id,
            isGroup:        false,
            name:           other?.name     || 'Unknown',
            username:       other?.username || '',
            email:          other?.email    || '',
            userId:         other?._id      || null,
            userImage:      other?.image    || null,  // participant's profile pic
            image:          conv.image || other?.image || null, // conv image or fallback
            unreadCount:    unreadMap[conv._id.toString()] || 0,
          };
        }),
      // Group conversations — isGroup always true, skip if groupDetails missing
      ...groupConvs
        .filter(conv => conv.isGroup && conv.groupDetails)
        .map(conv => ({
          conversationId: conv._id,
          isGroup:        true,
          name:           conv.groupDetails.name        || 'Group',
          description:    conv.groupDetails.description || '',
          image:          conv.groupDetails.image       || null,
          members:        conv.groupDetails.members     || [],
          admin:          conv.groupDetails.admin       || null,
          unreadCount:    unreadMap[conv._id.toString()] || 0,
        })),
    ];

    res.json(result);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// ── Mark conversation as read (reset unread count to 0) ───────
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await UnreadCount.findOneAndUpdate(
      { conversationId, userId },
      { count: 0 },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
};