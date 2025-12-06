'use strict';

const gulp = require('gulp');
const del = require('del');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Recursive function to get all files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Clean thumbs
gulp.task('clean-thumbs', function () {
  return del(['images/thumbs/**/*']);
});

// Generate thumbs
gulp.task('resize-thumbs', function (cb) {
  const fullsDir = 'images/fulls';
  const thumbsDir = 'images/thumbs';

  // Ensure thumbs root exists
  if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
  }

  try {
    const allFiles = getAllFiles(fullsDir);

    const imageFiles = allFiles.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.log('Nenhuma imagem encontrada para processar');
      return cb();
    }

    let processed = 0;

    imageFiles.forEach(file => {
      // Calculate relative path to maintain structure
      // e.g. images/fulls/Nature/img.jpg -> Nature/img.jpg
      const relativePath = path.relative(fullsDir, file);
      const outputPath = path.join(thumbsDir, relativePath);
      const outputDir = path.dirname(outputPath);

      // Ensure specific subdirectory exists in thumbs
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      sharp(file)
        .resize(512, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
          processed++;
          if (processed === imageFiles.length) cb();
        })
        .catch(err => {
          console.error(`Erro ao processar ${file}:`, err.message);
          processed++;
          if (processed === imageFiles.length) cb();
        });
    });
  } catch (err) {
    console.error("Erro na leitura dos arquivos:", err);
    cb();
  }
});

gulp.task('resize', gulp.series('clean-thumbs', 'resize-thumbs'));
