#!/usr/bin/env node
/**
 * Movie Poster Fetcher - Real posters from IMDb
 * Uses IMDb search and page scraping
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

const DELAY_MS = 300; // Rate limit

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// IMDb search suggestions API
function searchIMDb(title, year) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(`${title} ${year} movie`);
        const url = `https://v2.sg.media-imdb.com/suggestion/p/${query}.json`;
        
        const req = https.get(url, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (results && results.length > 0) {
                        const movie = results[0];
                        if (movie.i && movie.i.imageUrl) {
                            // Convert thumbnail to full size
                            const imageId = movie.i.imageUrl.split('/').pop();
                            const posterUrl = `https://m.media-amazon.com/images/M/${imageId}`;
                            resolve(posterUrl);
                            return;
                        }
                    }
                    resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        });
        
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

// Try alternative search with just English title
async function searchWithEnglishTitle(chineseTitle, year) {
    // Map of known Chinese to English titles
    const titleMap = {
        '小森林—春夏、秋冬': 'Little Forest',
        '疯狂动物城': 'Zootopia',
        '蜘蛛侠-平行宇宙': 'Spider-Man Into the Spider-Verse',
        '2012': '2012',
        '后天': 'The Day After Tomorrow',
        '超人总动员': 'The Incredibles',
        '驯龙高手1': 'How to Train Your Dragon',
        'Toys 4': 'Toy Story 4',
        '流浪地球': 'The Wandering Earth',
        '当幸福来敲门': 'The Pursuit of Happyness',
        'I Robot': 'I Robot',
        'Legend': 'Legend',
        '黑衣人1、2': 'Men in Black',
        '哪吒': 'Ne Zha',
        '阿甘正传': 'Forrest Gump',
        '怦然心动': 'Flipped',
        '少年派的奇幻漂流': 'Life of Pi',
        '头号玩家': 'Ready Player One',
        '盗梦空间': 'Inception',
        '禁闭岛': 'Shutter Island',
        '双子杀手': 'Gemini Man',
        '泰坦尼克号': 'Titanic',
        '冰雪奇缘2': 'Frozen 2',
        '楚门的世界': 'The Truman Show',
        '致命魔术': 'The Prestige',
        '小妇人': 'Little Women',
        '心灵捕手': 'Good Will Hunting',
        '精灵旅社': 'Hotel Transylvania',
        '贫民窟里的百万富翁': 'Slumdog Millionaire',
        '黑客帝国1': 'The Matrix',
        '陈情令': 'The Untamed',
        '新龙门客栈': 'New Dragon Gate Inn',
        '海蒂和爷爷': 'Heidi',
        'JOJO RABBIT': 'Jojo Rabbit',
        '罗马假日': 'Roman Holiday',
        'mean girl': 'Mean Girls',
        '独立日': 'Independence Day',
        '安妮日记': 'The Diary of Anne Frank',
        'AI': 'AI Artificial Intelligence',
        '傲慢与偏见': 'Pride and Prejudice',
        '理智与情感': 'Sense and Sensibility',
        '爱玛': 'Emma',
        '超体': 'Lucy',
        '乱世佳人': 'Gone with the Wind',
        '勇敢者的游戏': 'Jumanji',
        '花木兰2020': 'Mulan',
        '三傻大闹宝莱坞': '3 Idiots',
        '火星救援': 'The Martian',
        '谍影重重': 'The Bourne Identity',
        '甜蜜蜜': 'Comrades Almost a Love Story',
        '爱与怪物': 'Love and Monster',
        '菊次郎的夏天': 'Kikujiro',
        '微光城市': 'City of Ember',
        '垫底辣妹': 'Biri Girl',
        '信条': 'Tenet',
        '大白鲨': 'Jaws',
        '灵魂': 'Soul',
        '疯狂原始人2': 'The Croods 2',
        '无人生还': 'And Then There Were None',
        '灰猎犬号': 'Greyhound',
        'coranline': 'Coraline',
        '猫鼠游戏': 'Catch Me If You Can',
        '纵横四海': 'Once a Thief',
        '小鬼当家': 'Home Alone',
        '蓝风筝': 'The Blue Kite',
        '海上钢琴师': 'The Legend of 1900',
        '101斑点狗': '101 Dalmatians',
        '尼罗河上的惨案': 'Death on the Nile',
        '看不见的客人': 'The Invisible Guest',
        '阳光下的罪恶': 'Evil Under the Sun',
        '魔戒1': 'The Lord of the Rings',
        '沉睡魔咒': 'Maleficent',
        '角斗士': 'Gladiator',
        '教父': 'The Godfather',
        '珍珠港': 'Pearl Harbor',
        '情书': 'Love Letter',
        '侏罗纪公园': 'Jurassic Park',
        '达芬奇密码': 'The Da Vinci Code',
        '蝴蝶效应': 'The Butterfly Effect',
        '致命ID': 'Identity',
        '你的名字': 'Your Name',
        '无间道': 'Infernal Affairs',
        '源代码': 'Source Code',
        '弱点': 'The Blind Side',
        '小岛惊魂': 'The Others',
        '尚气和十环传奇': 'Shang-Chi',
        '恐怖游轮': 'Triangle',
        '雨人': 'Rain Man',
        '沙丘': 'Dune',
        '社交网络': 'The Social Network',
        '疯狂的石头': 'Crazy Stone',
        '魔女宅急便': 'Kikis Delivery Service',
        '荒岛余生': 'Cast Away',
        '不要抬头': 'Dont Look Up',
        '圣诞夜惊魂': 'The Nightmare Before Christmas',
        '幸福终点站': 'The Terminal',
        '芬奇': 'Finch',
        '你好，李焕英': 'Hi, Mom',
        '爱情神话': 'B神话',
        '雄狮少年': 'The Roar of the Grasslands',
        '记忆碎片': 'Memento',
        '十二猴子': '12 Monkeys',
        '犬之力': 'The Power of the Dog',
        '闪灵': 'The Shining',
        '飞跃疯人院': 'One Flew Over the Cuckoos Nest',
        '何以为家': 'Capernaum',
        '海市蜃楼': 'Mirage',
        'CODA': 'CODA',
        'Wall-E': 'WALL-E',
        '瞬息全宇宙': 'Everything Everywhere All at Once',
        '消失的爱人': 'Gone Girl',
        '本杰明·巴顿奇事': 'The Curious Case of Benjamin Button',
        '天鹅挽歌': 'Swan Song',
        '饥饿游戏': 'The Hunger Games',
        '风声': 'The Message',
        '红辣椒': 'Paprika',
        '地心引力': 'Gravity',
        '让子弹飞': 'Let the Bullets Fly',
        'Avatar2': 'Avatar The Way of Water',
        '大话西游1': 'A Chinese Odyssey Part One',
        '大话西游2': 'A Chinese Odyssey Part Two',
        '龙纹身女孩': 'The Girl with the Dragon Tattoo',
        '七号房的礼物': 'Miracle in Cell No 7',
        '冰血暴': 'Fargo',
        '马里奥': 'The Super Mario Bros Movie',
        '敦刻尔克': 'Dunkirk',
        '芭比': 'Barbie',
        '奥本海默': 'Oppenheimer',
        '穿prada的恶魔': 'The Devil Wears Prada',
        '花束般的恋爱': 'My Late Girlfriend',
        '长安三万里': 'Chang An',
        '封神第一部': 'Creation of the Gods',
        '夜访吸血鬼': 'Interview with the Vampire',
        'past lives': 'Past Lives',
        '花月杀手': 'Killers of the Flower Moon',
        '周处除三害': 'The Pig the Snake and the Pigeon',
        '机器人之梦': 'Robot Dreams',
        'Her': 'Her',
        'Princess mononoke': 'Princess Mononoke',
        '千与千寻': 'Spirited Away',
        'inside out2': 'Inside Out 2',
        '12 angry men': '12 Angry Men',
        'Divergent': 'Divergent',
        '你想活出怎样的人生': 'How Do You Live',
        '好东西': 'Her Story',
        'the wicked': 'Wicked',
        'the holdovers': 'The Holdovers',
        'moon': 'Moon',
        'La La Land': 'La La Land',
        'Brooklyn': 'Brooklyn',
        '哈尔的移动城堡': 'Howls Moving Castle',
        '哪吒2': 'Ne Zha 2',
        'Flow': 'Flow',
        '心迷宫': 'Chronic',
        'Parent trap': 'The Parent Trap',
        'Alice in wonderland': 'Alice in Wonderland',
        'Big eyes': 'Big Eyes',
        'the intouchable': 'The Intouchables',
        'Nosferatu': 'Nosferatu',
        'before sunrise': 'Before Sunrise',
        'before midnight': 'Before Midnight',
        'maze runner': 'The Maze Runner',
        'Penguin lessons': 'The Penguin Lessons',
        '芙蓉镇': 'Furong Town',
        '死亡诗社': 'Dead Poets Society',
        'The Post': 'The Post',
        '妈妈咪呀': 'Mamma Mia',
        "Ocean's 8": 'Ocean\'s Eight',
        'Zootopia 2': 'Zootopia 2',
        'the big short': 'The Big Short',
        '托斯卡纳艳阳下': 'Under the Tuscan Sun',
        'Heathers': 'Heathers',
    };
    
    const englishTitle = titleMap[chineseTitle] || chineseTitle;
    return searchIMDb(englishTitle, year);
}

async function fetchAllPosters() {
    console.log(`Fetching real posters for ${movies.length} movies...\n`);
    
    let updated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        const progress = `[${i + 1}/${movies.length}]`;
        
        // Skip if already has real poster
        if (movie.poster && movie.poster.includes('m.media-amazon.com')) {
            skipped++;
            if ((i + 1) % 20 === 0) {
                console.log(`${progress} ${movie.title} - already has poster`);
            }
            continue;
        }
        
        console.log(`${progress} Fetching: ${movie.title} (${movie.year})...`);
        
        let posterUrl = await searchWithEnglishTitle(movie.title, movie.year);
        
        if (posterUrl) {
            movie.poster = posterUrl;
            updated++;
            console.log(`  ✓ Got poster`);
        } else {
            failed++;
            console.log(`  ✗ No poster found`);
        }
        
        await sleep(DELAY_MS);
        
        // Save progress
        if ((i + 1) % 25 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`\n--- Progress: ${updated} updated, ${failed} failed, ${skipped} skipped ---\n`);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    console.log(`\n========================================`);
    console.log(`Done!`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Failed: ${failed}`);
    console.log(`  - Skipped: ${skipped}`);
    console.log(`========================================\n`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllPosters().catch(console.error);
