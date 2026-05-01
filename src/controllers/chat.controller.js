import { Group, Conversation } from '../models/chat.model.js';
import { User } from '../models/user.model.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    //check if participants are not the person logged in
    if(members.includes(req.user.id)){
        return res.status(400).json({ error: "You cannot add yourself as a member, you will be added automatically as the admin." });
    }
    let allMembers = [...members, req.user.id];
    const uniqueMembers = [...new Set(allMembers)];

    //check if group with same name already exists for the admin
    const existingGroup = await Group.findOne({ name, admin: req.user.id });
    if (existingGroup) {
      return res.status(400).json({ error: "You already have a group with this name. Please choose a different name." });
    }

    // Create the group entity
    const newGroup = await Group.create({ 
      name, description, members: uniqueMembers, admin: req.user.id, image: req.file.path
    });
    
    // Create the conversation link
    await Conversation.create({ groupDetails: newGroup._id, isGroup: true });
    
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const createContact = async (req, res) => {
  const { name, email } = req.body;
  
  let user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: "User with this email not found. Please ask them to register first." });
  }

  if (user._id.toString() === req.user.id) {
    return res.status(400).json({ error: "You cannot add yourself as a contact." });
  }

  const conversation = await Conversation.create({
    participants: [req.user.id, user._id],
    isGroup: false
  });
  
  res.status(201).json(conversation);
};



export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [
        { participants: userId },              // direct chats
        { isGroup: true }                      // groups (filter by membership below)
      ]
    })
    .populate('participants', 'name username email')
    .populate({
      path: 'groupDetails',
      populate: { path: 'members', select: 'name username email' }
    })
    .sort({ updatedAt: -1 });

    // Filter groups where user is actually a member
    const filtered = conversations.filter(conv => {
      if (!conv.isGroup) return true;
      if (!conv.groupDetails) return false;
      return conv.groupDetails.members.some(
        m => m._id.toString() === userId
      );
    });

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


