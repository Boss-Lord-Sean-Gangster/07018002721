const express = require('express');
const axios = require('axios');
const uuid = require('uuid').v4;

const app = express();
const port = 3000;

const BASE_URL = 'http://20.244.56.144/test/companies';
const TOKEN = 'YOUR AUTH TOKEN'; // Replace with your actual token

app.get('/categories/:categoryname/products', async (req, res) => {
  const categoryName = req.params.categoryname;
  const n = parseInt(req.query.n) || 10;
  const minPrice = parseFloat(req.query.minPrice) || 0;
  const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
  const page = parseInt(req.query.page) || 1;
  const sort = req.query.sort || 'price';
  const order = req.query.order || 'asc';
  const company = req.query.company || 'AMZ'; // Example default company

  try {
      const response = await axios.get(`${BASE_URL}/${company}/categories/${categoryName}/products`, {
          headers: {
              'Authorization': `Bearer ${TOKEN}`
          },
          params: {
              top: n,
              minPrice: minPrice,
              maxPrice: maxPrice,
              sort: sort,
              order: order
          }
      });

      res.send(response.data); // Log full response

      const products = response.data.products || [];
      const totalProducts = products.length;
      const totalPages = Math.ceil(totalProducts / n);

      // Paginate the products
      const paginatedProducts = products.slice((page - 1) * n, page * n).map(product => ({
          ...product,
          id: uuid() // Add unique identifier
      }));

      res.json({
          products: paginatedProducts,
          totalProducts,
          totalPages,
          currentPage: page
      });
  } catch (error) {
      console.error('Error fetching products:', error.response ? error.response.data : error.message);
      res.status(error.response ? error.response.status : 500).json({ error: 'Error fetching products' });
  }
});


app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { categoryname, productid } = req.params;
    const company = req.query.company || 'AMZ'; // Example default company

    try {
        const response = await axios.get(`${BASE_URL}/${company}/categories/${categoryname}/products`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`
            }
        });

        const product = response.data.products.find(p => p.id === productid);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product details:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({ error: 'Error fetching product details' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
