'use strict';

const gulp = require('gulp');
const del = require('del');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Apagar thumbs antigos
gulp.task('clean-thumbs', function () {
  return del(['images/thumbs/*.*']);
});

// Gerar thumbs
gulp.task('resize-thumbs', function (cb) {
  const fullsDir = 'images/fulls';
  const thumbsDir = 'images/thumbs';
  
  if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
  }
  
  fs.readdir(fullsDir, (err, files) => {
    if (err) {
      console.error('Erro ao ler diretório:', err);
      return cb(err);
    }
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(ext);
    });
    
    if (imageFiles.length === 0) {
      console.log('Nenhuma imagem encontrada para processar');
      return cb();
    }
    
    let processed = 0;
    
    imageFiles.forEach(file => {
      const inputPath = path.join(fullsDir, file);
      const outputPath = path.join(thumbsDir, path.parse(file).name + '.jpg');
      
      sharp(inputPath)
        .resize(512, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
          processed++;
          if (processed === imageFiles.length) {
            cb();
          }
        })
        .catch(err => {
          console.error(`Erro ao processar ${file}:`, err.message);
          processed++;
          if (processed === imageFiles.length) {
            cb();
          }
        });
    });
  });
});

// Tarefa principal
gulp.task('resize', gulp.series('clean-thumbs', 'resize-thumbs'));
