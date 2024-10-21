import mongoose from 'mongoose';

const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, required: true, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}); // Ensures a user is associated

const Todo = mongoose.model('Todo', TodoSchema);

export default Todo;
