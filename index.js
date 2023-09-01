const express = require('express');
const index = express();
index.use(express.urlencoded({ extended: true }));

const db = require('./util/database');
index.set('view engine', 'ejs');
index.use(express.static('public'))

index.get('/blogs', async (req, res) => {
  try {
    const blogsQuery = 'SELECT * FROM blogs';
    const blogs = await new Promise((resolve, reject) => {
      db.query(blogsQuery, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });

    const blogsWithComments = [];

    for (const blog of blogs) {
      const commentQuery = 'SELECT * FROM comment WHERE id = ?';
      const comments = await new Promise((resolve, reject) => {
        db.query(commentQuery, [blog.id], (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });

      blogsWithComments.push({
        blog: blog,
        comments: comments,
      });
    }

    res.render('index', { blogsWithComments });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

index.post('/blogs', (req, res)=>{
    const {title, author, content} = req.body;
    const postQuery = 'INSERT INTO blogs (b_title, b_author, b_content) VALUES (?, ?, ?)';
    const values = [title, author, content];
    db.query(postQuery, values, (err, result)=>{
        if(err) throw err;
        console.log('Data inserted');
        res.redirect('/blogs');
    })
})

index.post('/add-comment/:blogId', (req, res)=>{
    const commentBody = req.body.commentData;
    const blogId = req.params.blogId;
    const postComment = 'INSERT INTO comment (para, id) VALUES (?, ?)';
    db.query(postComment, [commentBody, blogId], (err, result)=>{
        if(err) throw err;
        console.log('Data inserted in comment box');
        res.redirect('/blogs');
    })
})

index.post('/delete-comment/:commentData', (req, res) => {
    const deleteData = req.params.commentData;
    db.query('DELETE FROM comment WHERE cid = ?', [deleteData], (err, result)=>{
      if(err) throw err;
      console.log(result)
      res.redirect('/blogs')
    });
 }
);

db.connect((err)=>{
    if(err) console.log(err)
    console.log("Database Connected")
})

index.listen(3000, (req, res)=>{
    console.log("Website is running on port number 3000");
})