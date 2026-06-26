const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, dbRun, dbGet } = require('./db.js');
const productsRouter = require('./routes/products.js');
const authRouter = require('./routes/auth.js');
const ordersRouter = require('./routes/orders.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/debug', (req, res) => {
  try {
    const { dbAll } = require('./db.js');
    const cats = dbAll('SELECT * FROM categories');
    res.json({ cats, ready, initPromise: !!initPromise });
  } catch(e) {
    res.json({ error: e.message, stack: e.stack });
  }
});

let ready = false;
let initPromise = null;

app.use((req, res, next) => {
  if (req.path === '/api/health') return next();
  if (ready) return next();
  if (!initPromise) {
    initPromise = initDb().then(() => {
      const catCount = dbGet("SELECT COUNT(*) as c FROM categories");
      if (!catCount || catCount.c === 0) {
        dbRun('INSERT INTO categories (name_ar, name_en) VALUES (?, ?)', ['أحمر شفاه', 'Lipstick']);
        dbRun('INSERT INTO categories (name_ar, name_en) VALUES (?, ?)', ['مكياج عيون', 'Eye Makeup']);
        dbRun('INSERT INTO categories (name_ar, name_en) VALUES (?, ?)', ['أساس', 'Foundation']);
        dbRun('INSERT INTO categories (name_ar, name_en) VALUES (?, ?)', ['عناية بالبشرة', 'Skincare']);
        dbRun('INSERT INTO categories (name_ar, name_en) VALUES (?, ?)', ['عطور', 'Perfumes']);
        const prods = [
          ['أحمر شفاه أحمر','Red Lipstick','طويل الثبات','Long-lasting',45,50,1,1],
          ['ماسكارا سوداء','Black Mascara','لتطويل الرموش','Volumizing',55,40,2,1],
          ['ظلال عيون','Eyeshadow Palette','12 لون','12 colors',85,20,2,1],
          ['كريم أساس','Foundation','سائل طبيعي','Natural liquid',70,35,3,0],
          ['مرطب للوجه','Face Moisturizer','يومي للبشرة','Daily moisturizer',60,45,4,1],
          ['عطر زهري','Floral Perfume','رائحة أزهار','Floral scent',120,15,5,1],
          ['سيروم فيتامين C','Vitamin C Serum','مضيء للبشرة','Brightening',95,25,4,0],
          ['آيلاينر أسود','Black Eyeliner','مقاوم للماء','Waterproof',35,60,2,0],
          ['بودرة وجه','Face Powder','شفافة لتثبيت','Translucent setting',50,30,3,0],
        ];
        for (const p of prods) dbRun('INSERT INTO products (name_ar, name_en, description_ar, description_en, price, stock, category_id, featured) VALUES (?,?,?,?,?,?,?,?)', p);
      }
      ready = true;
    }).catch(e => console.error('Init error:', e));
  }
  initPromise.then(() => next()).catch(() => next());
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
