#!/usr/bin/env node
/**
 * Movie Poster Fetcher using TVMaze API (free, no API key needed)
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

const DELAY_MS = 300;

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Title mappings for better search
const searchTitles = {
    '小森林—春夏、秋冬': 'Little Forest 2014',
    '疯狂动物城': 'Zootopia',
    '蜘蛛侠-平行宇宙': 'Spider-Man Into the Spider-Verse',
    '2012': '2012',
    '后天': 'Day After Tomorrow',
    '超人总动员': 'Incredibles',
    '驯龙高手1': 'How to Train Your Dragon',
    'Toys 4': 'Toy Story 4',
    '流浪地球': 'Wandering Earth',
    '当幸福来敲门': 'Pursuit of Happyness',
    'I Robot': 'I Robot',
    'Legend': 'Legend 2015',
    '黑衣人1、2': 'Men in Black',
    '哪吒': 'Ne Zha 2019',
    '阿甘正传': 'Forrest Gump',
    '怦然心动': 'Flipped',
    '少年派的奇幻漂流': 'Life of Pi',
    '头号玩家': 'Ready Player One',
    '盗梦空间': 'Inception',
    '禁闭岛': 'Shutter Island',
    '双子杀手': 'Gemini Man',
    '泰坦尼克号': 'Titanic',
    '冰雪奇缘2': 'Frozen 2',
    '楚门的世界': 'Truman Show',
    '致命魔术': 'Prestige',
    '小妇人': 'Little Women 2019',
    '心灵捕手': 'Good Will Hunting',
    '精灵旅社': 'Hotel Transylvania',
    '贫民窟里的百万富翁': 'Slumdog Millionaire',
    '黑客帝国1': 'Matrix',
    '新龙门客栈': 'New Dragon Gate Inn',
    '海蒂和爷爷': 'Heidi 2015',
    'JOJO RABBIT': 'Jojo Rabbit',
    '罗马假日': 'Roman Holiday',
    'mean girl': 'Mean Girls',
    '独立日': 'Independence Day',
    '安妮日记': 'Diary of Anne Frank',
    'AI': 'Artificial Intelligence',
    '傲慢与偏见': 'Pride and Prejudice 2005',
    '理智与情感': 'Sense and Sensibility',
    '爱玛': 'Emma 1996',
    '超体': 'Lucy 2014',
    '乱世佳人': 'Gone with the Wind',
    '勇敢者的游戏': 'Jumanji',
    '花木兰2020': 'Mulan 2020',
    '三傻大闹宝莱坞': '3 Idiots',
    '火星救援': 'Martian',
    '谍影重重': 'Bourne Identity',
    '甜蜜蜜': 'Comrades Almost a Love Story',
    '爱与怪物': 'Love and Monster',
    '菊次郎的夏天': 'Kikujiro',
    '微光城市': 'City of Ember',
    '垫底辣妹': 'Biri Girl',
    '信条': 'Tenet',
    '大白鲨': 'Jaws',
    '灵魂': 'Soul 2020',
    '疯狂原始人2': 'Croods 2',
    '无人生还': 'And Then There Were None 2015',
    '灰猎犬号': 'Greyhound 2020',
    'coranline': 'Coraline',
    '猫鼠游戏': 'Catch Me If You Can',
    '纵横四海': 'Once a Thief',
    '小鬼当家': 'Home Alone',
    '蓝风筝': 'Blue Kite',
    '海上钢琴师': 'Legend of 1900',
    '尼罗河上的惨案': 'Death on the Nile 2022',
    '看不见的客人': 'Invisible Guest',
    '阳光下的罪恶': 'Evil Under the Sun',
    '魔戒1': 'Lord of the Rings Fellowship',
    '沉睡魔咒': 'Maleficent',
    '角斗士': 'Gladiator',
    '教父': 'Godfather',
    '珍珠港': 'Pearl Harbor',
    '情书': 'Love Letter',
    '侏罗纪公园': 'Jurassic Park',
    '达芬奇密码': 'Da Vinci Code',
    '蝴蝶效应': 'Butterfly Effect',
    '致命ID': 'Identity 2003',
    '你的名字': 'Your Name',
    '无间道': 'Infernal Affairs',
    '源代码': 'Source Code',
    '弱点': 'Blind Side',
    '小岛惊魂': 'The Others',
    '尚气和十环传奇': 'Shang-Chi',
    '恐怖游轮': 'Triangle',
    '雨人': 'Rain Man',
    '沙丘': 'Dune 2021',
    '社交网络': 'Social Network',
    '疯狂的石头': 'Crazy Stone',
    '魔女宅急便': 'Kikis Delivery Service',
    '荒岛余生': 'Cast Away',
    '不要抬头': 'Dont Look Up',
    '圣诞夜惊魂': 'Nightmare Before Christmas',
    '幸福终点站': 'Terminal',
    '芬奇': 'Finch',
    '你好，李焕英': 'Hi Mom',
    '雄狮少年': 'The Roaring',
    '记忆碎片': 'Memento',
    '十二猴子': '12 Monkeys',
    '犬之力': 'Power of the Dog',
    '闪灵': 'Shining',
    '飞跃疯人院': 'One Flew Over Cuckoos Nest',
    '何以为家': 'Capernaum',
    '海市蜃楼': 'Mirage',
    'CODA': 'CODA',
    'Wall-E': 'WALL-E',
    '瞬息全宇宙': 'Everything Everywhere All at Once',
    '消失的爱人': 'Gone Girl',
    '本杰明·巴顿奇事': 'Benjamin Button',
    '天鹅挽歌': 'Swan Song',
    '饥饿游戏': 'Hunger Games',
    '风声': 'Message',
    '红辣椒': 'Paprika',
    '地心引力': 'Gravity',
    '让子弹飞': 'Let the Bullets Fly',
    'Avatar2': 'Avatar Way of Water',
    '大话西游1': 'Chinese Odyssey',
    '大话西游2': 'Chinese Odyssey Part Two',
    '龙纹身女孩': 'Girl with Dragon Tattoo',
    '七号房的礼物': 'Miracle in Cell No 7',
    '冰血暴': 'Fargo',
    '马里奥': 'Super Mario Bros Movie',
    '敦刻尔克': 'Dunkirk',
    '芭比': 'Barbie',
    '奥本海默': 'Oppenheimer',
    '穿prada的恶魔': 'Devil Wears Prada',
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
    '心迷宫': 'Maze',
    'Parent trap': 'Parent Trap',
    'Alice in wonderland': 'Alice in Wonderland',
    'Big eyes': 'Big Eyes',
    'the intouchable': 'Intouchables',
    'Nosferatu': 'Nosferatu',
    'before sunrise': 'Before Sunrise',
    'before midnight': 'Before Midnight',
    'maze runner': 'Maze Runner',
    'Penguin lessons': 'Penguin Lessons',
    '芙蓉镇': 'Furong Town',
    '死亡诗社': 'Dead Poets Society',
    'The Post': 'Post',
    '妈妈咪呀': 'Mamma Mia',
    "Ocean's 8": 'Oceans 8',
    'Zootopia 2': 'Zootopia 2',
    'the big short': 'Big Short',
    '托斯卡纳艳阳下': 'Under the Tuscan Sun',
    'Heathers': 'Heathers',
    '七面钟': 'Seven Faces',
    '10号房的客人': 'Guest at Number 10',
    '007皇家赌场': 'Casino Royale 2006',
    '007：皇家赌场': 'Casino Royale 2006',
    '利刃出鞘': 'Knives Out',
    '利刃出鞘2': 'Glass Onion',
    '利刃出鞘3': 'Knives Out 3',
    '分歧者': 'Divergent',
    '逃离德黑兰': 'Argo',
    '天气': 'Weather',
    '怪物': 'Monster',
};

function fetchFromTVMaze(title, year) {
    return new Promise((resolve) => {
        const searchTitle = searchTitles[title] || `${title} ${year}`;
        const query = encodeURIComponent(searchTitle);
        const url = `https://api.tvmaze.com/search/shows?q=${query}`;
        
        const req = https.get(url, { timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (results && results.length > 0 && results[0].show && results[0].show.image) {
                        resolve(results[0].show.image.original);
                    } else {
                        resolve(null);
                    }
                } catch (e) {
                    resolve(null);
                }
            });
        });
        
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

async function fetchAllPosters() {
    console.log(`Fetching posters for ${movies.length} movies from TVMaze...\n`);
    
    let updated = 0;
    let failed = 0;
    const usedPosters = new Set();
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        
        // Skip if already has a poster
        if (movie.poster && movie.poster.includes('m.media-amazon.com')) {
            if ((i + 1) % 25 === 0) {
                console.log(`[${i + 1}/${movies.length}] ${movie.title} - already has poster`);
            }
            continue;
        }
        
        console.log(`[${i + 1}/${movies.length}] ${movie.title} (${movie.year})...`);
        
        const posterUrl = await fetchFromTVMaze(movie.title, movie.year);
        
        if (posterUrl) {
            movie.poster = posterUrl;
            usedPosters.add(posterUrl);
            updated++;
            console.log(`  ✓ Got poster`);
        } else {
            failed++;
            console.log(`  ✗ Not found`);
        }
        
        await sleep(DELAY_MS);
        
        if ((i + 1) % 25 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`\n--- Progress: ${updated} updated, ${failed} failed ---\n`);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    console.log(`\nDone! ${updated} updated, ${failed} failed`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllPosters().catch(console.error);
