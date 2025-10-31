require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path =require('path');
const { validateUser } = require('./utils/validation');

const userFilePath = path.join(__dirname, 'users.json');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
      <h1>Curso Express.js V3</h1>
      <p>Esto es una aplicación node.js con express.js</p>
      <p>Corre en el puerto: ${PORT}</p>
    `);
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`Mostrar información del usuario con ID: ${userId}`);
});

app.get('/search', (req, res) => {
  const terms = req.query.termino || 'No especificado';
  const category = req.query.categoria || 'Todas';

  res.send(`
      <h2>Resultados de Busqueda:</h2>
      <p>Término: ${terms}</p>
      <p>Categoría: ${category}</p>
    `);
});

app.post('/form', (req, res) =>{
  const name = req.body.nombre || 'Anonimo';
  const email = req.body.email || 'No proporcionado';
  res.json({
    mesagge:'datos recibidos',
    data: {
      name,
      email
    }
  })
});

app.post('/api/data', (req, res)=>{
  const data = req.body;

    if(!data || Object.keys(data).length === 0) {
      return res.status(400).json({error: 'no se recibieron datos'})
    }

    res.status(201).json({
      message: 'datos json recibidos',
      data
    })
});

app.get('/users', (req, res)=>{
  fs.readFile(userFilePath , 'utf-8', (err , data)=>{
    if (err){
      return res.status(500).json({error:'error con conexion de datos'});
    }
    const users = JSON.parse(data);

    res.json(users);
  });
});

app.post('/users', (req, res)=>{
  const newUser = req.body;
  fs.readFile(userFilePath, 'utf-8', (err, data)=>{
    if (err){
      return res.status(500).json({error:'error con conexion de datos'});
    };
    const users = JSON.parse(data);

    const validation = validateUser(newUser, users);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    users.push(newUser);
    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err)=>{
      if (err){
        return res.status(500).json({error:'error al guardar el usuario'});
      }
      res.status(201).json(newUser);
    });
  });
});
 app.put('/users/:id', (req, res)=>{
  const userId = parseInt(req.params.id, 10);
  const updateUser = req.body;

  fs.readFile(userFilePath, 'utf-8', (err, data)=>{

    if (err){
     return  res.status(500).json({error:'error con conexion de datos'});
    }
    let users = JSON.parse(data);

       const validation = validateUser(updatedUser, users);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    users = users.map(user =>(user.id === userId ? {...user, ...updateUser} : user));

    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), (err)=>{
      if (err) {
        return res.status(500).json({error:'error al actualizar el usuario'});
      }

      res.json(updateUser);
    });
  });
 });

 app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error con conexion de datos.' });
    }
    let users = JSON.parse(data);
    users = users.filter(user => user.id !== userId);
    fs.writeFile(userFilePath, JSON.stringify(users, null, 2), err => {
      if (err) {
        return res.status(500).json({ error: 'Error al eliminar usuario.' });
      }
      res.status(204).send();
    });
  });
});


app.listen(PORT, () => {
  console.log(`Servidor: http://localhost:${PORT}`);
});
