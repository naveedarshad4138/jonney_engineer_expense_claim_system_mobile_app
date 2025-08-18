const fs = require('fs');
const fsp = require('fs/promises'); // <--- for async file operations
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const TOKEN_FILE = path.join(__dirname, 'ocrolus_token.json');

const OCROLUS = {
  clientId: process.env.OCROLUS_CLIENT_ID,
  clientSecret: process.env.OCROLUS_CLIENT_SECRET,
  tokenUrl: 'https://auth.ocrolus.com/oauth/token',
  apiBaseUrl: 'https://api.ocrolus.com/v1',
};

// Get saved token from file
const getStoredToken = () => {
  if (fs.existsSync(TOKEN_FILE)) {
    const data = JSON.parse(fs.readFileSync(TOKEN_FILE));
    if (data.access_token && (Date.now() - data.timestamp) < 12 * 60 * 60 * 1000) {
      return data.access_token;
    }
  }
  return null;
};

// Save token to file
const saveToken = (token) => {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify({ access_token: token, timestamp: Date.now() }));
};

// Get new token from Ocrolus
const fetchNewToken = async () => {
  const response = await axios.post(OCROLUS.tokenUrl, {
    grant_type: 'client_credentials',
    audience: 'https://api.ocrolus.com/',
    client_id: OCROLUS.clientId,
    client_secret: OCROLUS.clientSecret
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  const token = response.data.access_token;
  saveToken(token);
  return token;
};

const getAccessToken = async () => {
  return getStoredToken() || await fetchNewToken();
};

// Create new book
const createBook = async ({ name, book_class = 'COMMERCIAL', book_type = 'BANK_STATEMENT', is_public = true, xid }) => {
  const token = await getAccessToken();
  const response = await axios.post(`${OCROLUS.apiBaseUrl}/book/add`, {
    name,
    book_class,
    book_type,
    is_public,
    xid
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Upload document
const uploadDocument = async ({ book_uuid, filePath, doc_name }) => {
  const token = await getAccessToken();
  const form = new FormData();
  form.append('book_uuid', book_uuid);
  form.append('upload', fs.createReadStream(filePath));
  if (doc_name) form.append('doc_name', doc_name);

  const response = await axios.post(`${OCROLUS.apiBaseUrl}/book/upload`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
const getBookSummary = async (book_uuid, delayMs = 5000) => {
  const token = await getAccessToken();
  const url = `https://api.ocrolus.com/v2/book/${book_uuid}/summary`;

  while (true) {
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // ✅ Allow axios to not throw on 425/404 etc.
        validateStatus: (status) => true
      });

      const summary_response = res.data;

      if (!summary_response.status) {
        // ✅ Summary is ready
        return {
          status: 'success',
          data: summary_response
        };
      }

      if (summary_response.status === 425) {
        // 🔄 Still processing, retry
        console.log('⏳ Analytics still processing. Retrying in', delayMs / 1000, 'sec...');
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      if (summary_response.status === 404) {
        // ❌ No data
        return {
          status: 'not_found',
          message: 'No transactions found for this business.'
        };
      }

      // ⚠️ Some other status — return it anyway
      return {
        status: 'success',
        data: summary_response
      };

    } catch (err) {
      console.error('📛 Error fetching book summary:', err.message);
      throw new Error('Failed to fetch book summary.');
    }
  }
};
// const addOcrolusBook = async (existingForm, business_name, ein, attachments, res) => {
//   let book_uuid;
//   let bookResult = null;
// // Create a new book
//     bookResult = await createBook({
//       name: business_name,
//       book_class: 'INSTANT',
//       book_type: 'DEFAULT',
//       is_public: true,
//       xid: ein,
//     });
//     console.log(bookResult)
//   if (existingForm?.ocrolus_book_uuid) {
//     book_uuid = bookResult?.response?.uuid || existingForm.ocrolus_book_uuid;
//     console.log('📘 Reusing Ocrolus book:', book_uuid);
//   } else {
    

//     book_uuid = bookResult?.response?.uuid;

//     // if (!book_uuid) {
//     //   throw new Error(bookResult?.message || 'Failed to create Ocrolus book');
//     // }else{

//         // Upload attachments if any
//         if (attachments.length > 0) {
//             for (const file of attachments) {
//                 const tempPath = path.join(__dirname, '../tmp', Date.now() + '-' + file.originalname);
                
//                 // ✅ Write file using fs.promises
//                 await fsp.writeFile(tempPath, file.buffer);

//                 try {
//                 await uploadDocument({
//                     book_uuid,
//                     filePath: tempPath,
//                     doc_name: file.originalname,
//                 });
//                 } finally {
//                 // ✅ Delete file safely
//                 await fsp.unlink(tempPath).catch(() => {});
//                 }
//             }
//         }
//     // }
//     }

//   const summary = await getBookSummary(book_uuid);
//   return { summary, book_uuid, bookResult };
// };
const addOcrolusBook = async (existingForm, business_name, ein, attachments, res) => {
  let book_uuid;
  let bookResult = null;

  try {
    // Attempt to create a new book
    bookResult = await createBook({
      name: business_name,
      book_class: 'INSTANT',
      book_type: 'DEFAULT',
      is_public: true,
      xid: ein,
    });

    // Use UUID if creation succeeded
    book_uuid = bookResult?.response?.uuid;

    if (book_uuid) {
      console.log('📘 Created new Ocrolus book:', book_uuid);
    }else{
        book_uuid = existingForm?.ocrolus_book_uuid;
    }

  } catch (error) {
    const code = error?.code || error?.meta?.code;

    // If book already exists, fetch from DB or fallback
    if (code === 1402 || error?.message === 'Book exists') {
      console.warn('⚠️ Book already exists — trying fallback.');

      // Use existing UUID if available
      if (existingForm?.ocrolus_book_uuid) {
        book_uuid = existingForm.ocrolus_book_uuid;
        console.log('📘 Reusing existing Ocrolus book UUID:', book_uuid);
      } else {
        // Or fetch book from DB by xid (EIN)
        const existingBook = await getBookFromDatabaseByXid(ein);
        book_uuid = existingBook?.uuid;

        if (book_uuid) {
          console.log('📘 Found existing book from DB:', book_uuid);
        } else {
          throw new Error('❌ Book exists but could not retrieve UUID.');
        }
      }
    } else {
      throw new Error(error?.message || '❌ Unexpected error creating book');
    }
  }

  // 3. Upload attachments, if any
  if (attachments?.length > 0 && book_uuid) {
    for (const file of attachments) {
      const tempPath = path.join(__dirname, '../tmp', Date.now() + '-' + file.originalname);

      try {
        await fsp.writeFile(tempPath, file.buffer);

        await uploadDocument({
          book_uuid,
          filePath: tempPath,
          doc_name: file.originalname,
        });

      } catch (err) {
        console.error(`❌ Error uploading ${file.originalname}:`, err);
      } finally {
        await fsp.unlink(tempPath).catch(() => {});
      }
    }
  }

  // 4. Get book summary
  const summary = await getBookSummary(book_uuid);

  return {
    summary,
    book_uuid,
    bookResult,
  };
};



module.exports = {
  getAccessToken,
  createBook,
  uploadDocument,
  getBookSummary,
  addOcrolusBook
};
