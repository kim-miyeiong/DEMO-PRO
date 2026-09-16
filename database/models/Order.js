import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  order_id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true, index: true },
  items: [{
    book_id: { type: Number },
    book_title: { type: String },
    price_paid: { type: Number },
    quantity: { type: Number, default: 1 },
    cover_filename: { type: String, default: null },
    pdf_filename: { type: String, default: null },
  }],
  total_amount: { type: Number, required: true },
  payment_method: { type: String, default: 'Instant Pay (Demo)' },
  payment_status: { type: String, default: 'completed' },
  created_at: { type: Date, default: Date.now },
}, { collection: 'orders' });

const Order = mongoose.model('Order', OrderSchema);
export default Order;
