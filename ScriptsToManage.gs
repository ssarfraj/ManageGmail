
function deleteEmailsFromContact() {
  const email = "alerts@mailing.quikr.com"; // Replace with the contact's email
  const threads = GmailApp.search(`from:${email}`);
  
  Logger.log(`Found ${threads.length} email threads from: ${email}`);

  for (let i = 0; i < threads.length; i++) {
    threads[i].moveToTrash();
  }

  Logger.log(`Moved ${threads.length} email threads to Trash.`);
}


function findTopEmailSender() {
  const threads = GmailApp.getInboxThreads(0, 500); // Adjust the range (0, N) as needed
  const senderCount = {};

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    for (let j = 0; j < messages.length; j++) {
      const sender = messages[j].getFrom();
      const emailMatch = sender.match(/<(.+?)>/);
      const email = emailMatch ? emailMatch[1] : sender;

      senderCount[email] = (senderCount[email] || 0) + 1;
    }
  }

  // Find the sender with max count
  let maxSender = null;
  let maxCount = 0;
  for (let email in senderCount) {
    if (senderCount[email] > maxCount) {
      maxCount = senderCount[email];
      maxSender = email;
    }
  }

  Logger.log(`Sender with most emails: ${maxSender}`);
  Logger.log(`Total emails from that sender: ${maxCount}`);
}


function findTopEmailSendersExcluding() {
  const EXCLUDED_SENDERS = [
    "customercare@icicibank.com",

    // Add more emails to exclude as needed
  ];

  const threads = GmailApp.getInboxThreads(2000, 500); // Scan first 1000 threads
  const senderCount = {};

  for (let i = 0; i < threads.length; i++) {
    const messages = threads[i].getMessages();
    for (let j = 0; j < messages.length; j++) {
      const sender = messages[j].getFrom();
      const emailMatch = sender.match(/<(.+?)>/);
      const email = emailMatch ? emailMatch[1] : sender;

      if (!EXCLUDED_SENDERS.includes(email.toLowerCase())) {
        senderCount[email] = (senderCount[email] || 0) + 1;
      }
    }
  }

  // Convert to array for sorting
  const sortedSenders = Object.entries(senderCount).sort((a, b) => b[1] - a[1]);

  Logger.log("Top senders (excluding the ignored list):");
  for (let i = 0; i < Math.min(sortedSenders.length, 10); i++) {
    Logger.log(`${i + 1}. ${sortedSenders[i][0]} - ${sortedSenders[i][1]} emails`);
  }
}

function getTop10EmailSenders() {
  const BATCH_SIZE = 100;   // Number of threads per batch
  const MAX_THREADS = 1000; // Total number of threads to analyze
  const senderCount = {};
  
  for (let start = 0; start < MAX_THREADS; start += BATCH_SIZE) {
    const threads = GmailApp.getInboxThreads(start, BATCH_SIZE);
    if (threads.length === 0) break;
    
    for (const thread of threads) {
      const messages = thread.getMessages();
      for (const message of messages) {
        const sender = message.getFrom();
        const emailMatch = sender.match(/<(.+?)>/);
        const email = emailMatch ? emailMatch[1] : sender;

        senderCount[email] = (senderCount[email] || 0) + 1;
      }
    }
  }

  // Convert to sortable array
  const sortedSenders = Object.entries(senderCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10

  Logger.log("📬 Top 10 Senders:");
  sortedSenders.forEach(([email, count], index) => {
    Logger.log(`${index + 1}. ${email} — ${count} emails`);
  });
}


function deleteEmailsFromMatchingContacts() {
  const keyword = "techgig"; // 🔁 Replace with any word to search in email addresses
  const BATCH_SIZE = 100;
  const MAX_THREADS = 1000;
  let deletedCount = 0;

  for (let start = 0; start < MAX_THREADS; start += BATCH_SIZE) {
    const threads = GmailApp.getInboxThreads(start, BATCH_SIZE);
    if (threads.length === 0) break;

    for (const thread of threads) {
      const messages = thread.getMessages();
      for (const message of messages) {
        const sender = message.getFrom();
        const emailMatch = sender.match(/<(.+?)>/);
        const email = emailMatch ? emailMatch[1] : sender;

        if (email.toLowerCase().includes(keyword.toLowerCase())) {
          thread.moveToTrash();
          deletedCount++;
          break; // No need to check other messages in the same thread
        }
      }
    }
  }

  Logger.log(`🗑️ Deleted ${deletedCount} threads where sender email contains "${keyword}"`);
}

