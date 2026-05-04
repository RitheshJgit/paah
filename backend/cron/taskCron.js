import cron from 'node-cron';
import Task from '../models/Task.js';

cron.schedule('*/5 * * * *', async () => {
  const now = new Date();

  await Task.updateMany(
    {
      deadline: { $lt: now },
      status: 'active'
    },
    {
      status: 'completed'
    }
  );

  console.log('Expired tasks frozen');
});