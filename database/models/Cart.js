import mongoose, { Schema } from 'mongoose';

const CartItemSchema = new Schema({
  cartitem_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true, index: true },
  book_id: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
}, { collection: 'cartitems' });

CartItemSchema.index({ user_id: 1, book_id: 1 }, { unique: true });

const CartItem = mongoose.model('CartItem', CartItemSchema);
export default CartItem;
