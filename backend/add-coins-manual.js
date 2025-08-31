// Manual way to add coins to user for testing
import { User } from './models/User.js';
import { connectDB } from './utils/connectDb.js';
import dotenv from 'dotenv';

dotenv.config();

async function addCoinsManually() {
    try {
        await connectDB();

        const userId = "user_323WVCkin29TDPyKltxfwuIfpaG"; // Your test user ID

        const user = await User.findOneAndUpdate(
            { clerkId: userId },
            { 
                $inc: { coins: 100 },
                $setOnInsert: { 
                    clerkId: userId,
                    email: `${userId}@test.com`
                }
            },
            { upsert: true, new: true }
        );
        
        console.log(`✅ Added 100 coins to user ${userId}`);
        console.log(`💰 User now has ${user.coins} coins`);
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addCoinsManually();
