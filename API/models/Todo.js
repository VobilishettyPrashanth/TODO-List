import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true }, // Required text field for the todo item
  done: { type: Boolean, required: true, default: false }, // Default to false if not specified
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },}); // Ensures a user is associated

const Todo = mongoose.model('Todo', TodoSchema);

export default Todo;
