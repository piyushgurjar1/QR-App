// require('dotenv').config();
// const mysql = require('mysql2/promise');
// const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
// const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// // Configure DynamoDB client
// const client = new DynamoDBClient({ region: process.env.AWS_REGION });
// const docClient = DynamoDBDocumentClient.from(client);

// async function migrateData() {
//   try {
//     const connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       password: process.env.DB_PASSWORD,
//       database: process.env.DB_NAME,
//     });

//     // Migrate users
//     const [users] = await connection.query('SELECT * FROM user');
//     for (const user of users) {
//       const params = {
//         TableName: 'AppData',
//         Item: {
//           PK: `USER#${user.username}`,
//           SK: `USER#${user.username}`,
//           type: 'user',
//           name: user.name,
//           email: user.email,
//           contact: user.contact,
//           password: user.password,
//           role: user.role,
//         },
//       };

//       // Use AWS SDK v3 to put item into DynamoDB
//       await docClient.send(new PutCommand(params));
//       console.log(`Migrated user: ${user.username}`);
//     }

//     // Migrate children
//     const [children] = await connection.query('SELECT * FROM child_info');
//     for (const child of children) {
//       const params = {
//         TableName: 'AppData',
//         Item: {
//           PK: `CHILD#${child.username}`,
//           SK: `CHILD#${child.username}`,
//           type: 'child',
//           name: child.name,
//           parent_mail: child.parent_mail,
//           parent_contact: child.parent_contact,
//           password: child.password,
//           device_token: child.device_token,
//         },
//       };

//       // Use AWS SDK v3 to put item into DynamoDB
//       await docClient.send(new PutCommand(params));
//       console.log(`Migrated child: ${child.username}`);
//     }

//     console.log('Migration completed successfully.');
//   } catch (err) {
//     console.error('Error during migration:', err);
//   }
// }

// // Call the async function
// migrateData();