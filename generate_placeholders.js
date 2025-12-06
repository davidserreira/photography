const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = 'images/fulls';
const albums = {
    'Nature': ['#2ecc71', '#27ae60', '#1abc9c'],     // Greens
    'Urban': ['#34495e', '#2c3e50', '#7f8c8d'],       // Dark Blues/Greys
    'Trekking': ['#e67e22', '#d35400', '#f1c40f'],    // Earth/Orange
    'Portraits': ['#9b59b6', '#8e44ad', '#e74c3c'],   // Purples/Reds
    'Architecture': ['#ecf0f1', '#bdc3c7', '#95a5a6'] // Whites/Silvers
};

async function generate() {
    for (const [album, colors] of Object.entries(albums)) {
        const albumDir = path.join(root, album);
        if (!fs.existsSync(albumDir)) fs.mkdirSync(albumDir, { recursive: true });

        // Generate 3 images for each color
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            const fileName = `dummy_${album}_${i + 1}.jpg`;
            const filePath = path.join(albumDir, fileName);

            console.log(`Generating ${filePath} with color ${color}...`);

            await sharp({
                create: {
                    width: 800,
                    height: 600,
                    channels: 3,
                    background: color
                }
            })
                .jpeg()
                .toFile(filePath);
        }
    }
    console.log('Done!');
}

generate();
