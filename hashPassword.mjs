import argon2 from 'argon2';

// Tomar la contraseña desde los argumentos de la línea de comandos
const password = process.argv[2];

if (!password) {
  console.log('Por favor, ingresa una contraseña.');
  process.exit(1);
}

argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
})
  .then(hash => {
    console.log('Hash generado:', hash);
  })
  .catch(err => {
    console.error('Error al generar el hash:', err);
  });
