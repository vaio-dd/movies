#!/usr/bin/env node
/**
 * Movie Poster Fetcher using Wikipedia API (free, no API key needed!)
 */

const fs = require('fs');
const https = require('https');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

const DELAY_MS = 300;

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Wikipedia title mappings
const wikipediaTitles = {
    '小森林—春夏、秋冬': 'Little_Forest_(2014_film)',
    '疯狂动物城': 'Zootopia',
    '蜘蛛侠-平行宇宙': 'Spider-Man:_Into_the_Spider-Verse',
    '2012': '2012_(film)',
    '后天': 'The_Day_After_Tomorrow',
    '超人总动员': 'The_Incredibles',
    '驯龙高手1': 'How_to_Train_Your_Dragon',
    'Toys 4': 'Toy_Story_4',
    '流浪地球': 'The_Wandering_Earth_(film)',
    '当幸福来敲门': 'The_Pursuit_of_Happyness',
    'I Robot': 'I,_Robot_(film)',
    'Legend': 'Legend_(2015_film)',
    '黑衣人1、2': 'Men_in_Black_(film)',
    '哪吒': 'Ne_Zha_(2019_film)',
    '阿甘正传': 'Forrest_Gump',
    '怦然心动': 'Flipped_(film)',
    '少年派的奇幻漂流': 'Life_of_Pi_(film)',
    '头号玩家': 'Ready_Player_One_(film)',
    '盗梦空间': 'Inception',
    '禁闭岛': 'Shutter_Island',
    '双子杀手': 'Gemini_Man_(film)',
    '泰坦尼克号': 'Titanic_(1997_film)',
    '冰雪奇缘2': 'Frozen_II',
    '楚门的世界': 'The_Truman_Show',
    '致命魔术': 'The_Prestige_(film)',
    '小妇人': 'Little_Women_(2019_film)',
    '心灵捕手': 'Good_Will_Hunting',
    '精灵旅社': 'Hotel_Transylvania_(film)',
    '贫民窟里的百万富翁': 'Slumdog_Millionaire',
    '黑客帝国1': 'The_Matrix',
    '新龙门客栈': 'New_Dragon_Gate_Inn',
    '海蒂和爷爷': 'Heidi_(2015_film)',
    'JOJO RABBIT': 'Jojo_Rabbit',
    '罗马假日': 'Roman_Holiday',
    'mean girl': 'Mean_Girls',
    '独立日': 'Independence_Day_(1996_film)',
    '安妮日记': 'The_Diary_of_Anne_Frank_(2009_film)',
    'AI': 'A.I._Artificial_Intelligence',
    '傲慢与偏见': 'Pride_and_Prejudice_(2005_film)',
    '理智与情感': 'Sense_and_Sensibility_(1995_film)',
    '爱玛': 'Emma_(1996_film)',
    '超体': 'Lucy_(2014_film)',
    '乱世佳人': 'Gone_with_the_Wind',
    '勇敢者的游戏': 'Jumanji_(1995_film)',
    '花木兰2020': 'Mulan_(2020_film)',
    '三傻大闹宝莱坞': '3_Idiots',
    '火星救援': 'The_Martian_(film)',
    '谍影重重': 'The_Bourne_Identity_(film)',
    '爱与怪物': 'Love_and_Monster',
    '菊次郎的夏天': 'Kikujiro',
    '微光城市': 'City_of_Ember',
    '垫底辣妹': 'Biri_Girl',
    '信条': 'Tenet',
    '大白鲨': 'Jaws_(film)',
    '灵魂': 'Soul_(2020_film)',
    '疯狂原始人2': 'The_Croods:_A_New_Age',
    '无人生还': 'And_Then_There_Were_None_(2015_TV_series)',
    '灰猎犬号': 'Greyhound_(film)',
    'coranline': 'Coraline_(film)',
    '猫鼠游戏': 'Catch_Me_If_You_Can',
    '纵横四海': 'Once_a_Thief',
    '小鬼当家': 'Home_Alone',
    '蓝风筝': 'The_Blue_Kite',
    '海上钢琴师': 'The_Legend_of_1900',
    '尼罗河上的惨案': 'Death_on_the_Nile_(2022_film)',
    '看不见的客人': 'The_Invisible_Guest',
    '阳光下的罪恶': 'Evil_Under_the_Sun_(1982_film)',
    '魔戒1': 'The_Lord_of_the_Rings:_The_Fellowship_of_the_Ring',
    '沉睡魔咒': 'Maleficent',
    '角斗士': 'Gladiator_(2000_film)',
    '教父': 'The_Godfather',
    '珍珠港': 'Pearl_Harbor_(film)',
    '情书': 'Love_Letter_(1995_film)',
    '侏罗纪公园': 'Jurassic_Park',
    '达芬奇密码': 'The_Da_Vinci_Code_(film)',
    '蝴蝶效应': 'The_Butterfly_Effect_(film)',
    '致命ID': 'Identity_(2003_film)',
    '你的名字': 'Your_Name',
    '无间道': 'Infernal_Affairs',
    '源代码': 'Source_Code',
    '弱点': 'The_Blind_Side',
    '小岛惊魂': 'The_Others_(2001_film)',
    '尚气和十环传奇': 'Shang-Chi_and_the_Legend_of_the_Ten_Rings',
    '恐怖游轮': 'Triangle_(2009_film)',
    '雨人': 'Rain_Man',
    '沙丘': 'Dune_(2021_film)',
    '社交网络': 'The_Social_Network',
    '疯狂的石头': 'Crazy_Stone',
    '魔女宅急便': 'Kiki%27s_Delivery_Service_(film)',
    '荒岛余生': 'Cast_Away',
    '不要抬头': 'Don%27t_Look_Up_(film)',
    '圣诞夜惊魂': 'The_Nightmare_Before_Christmas',
    '幸福终点站': 'The_Terminal',
    '芬奇': 'Finch_(film)',
    '你好，李焕英': 'Hi,_Mom_(film)',
    '记忆碎片': 'Memento_(film)',
    '十二猴子': '12_Monkeys_(film)',
    '犬之力': 'The_Power_of_the_Dog_(film)',
    '闪灵': 'The_Shining',
    '飞跃疯人院': 'One_Flew_Over_the_Cuckoo%27s_Nest_(film)',
    '何以为家': 'Capernaum_(film)',
    '海市蜃楼': 'Miracle_in_Cell_No._7',
    'CODA': 'CODA_(film)',
    'Wall-E': 'WALL-E',
    '瞬息全宇宙': 'Everything_Everywhere_All_at_Once',
    '消失的爱人': 'Gone_Girl_(film)',
    '本杰明·巴顿奇事': 'The_Curious_Case_of_Benjamin_Button',
    '天鹅挽歌': 'Swan_Song_(2021_film)',
    '饥饿游戏': 'The_Hunger_Games',
    '风声': 'The_Message_(2009_film)',
    '红辣椒': 'Paprika_(2006_film)',
    '地心引力': 'Gravity_(film)',
    '让子弹飞': 'Let_the_Bullets_Fly',
    'Avatar2': 'Avatar:_The_Way_of_Water',
    '大话西游1': 'A_Chinese_Odyssey_Part_One',
    '大话西游2': 'A_Chinese_Odyssey_Part_Two',
    '龙纹身女孩': 'The_Girl_with_the_Dragon_Tattoo_(2011_film)',
    '七号房的礼物': 'Miracle_in_Cell_No._7',
    '冰血暴': 'Fargo_(film)',
    '马里奥': 'The_Super_Mario_Bros._Movie',
    '敦刻尔克': 'Dunkirk_(film)',
    '芭比': 'Barbie_(film)',
    '奥本海默': 'Oppenheimer_(film)',
    '穿prada的恶魔': 'The_Devil_Wears_Prada',
    '花束般的恋爱': 'My_Late_Girlfriend',
    '长安三万里': 'Three_Miles',
    '封神第一部': 'Creation_of_the_Gods',
    '夜访吸血鬼': 'Interview_with_the_Vampire_(film)',
    'past lives': 'Past_Lives',
    '花月杀手': 'Killers_of_the_Flower_Moon_(film)',
    '周处除三害': 'The_Pig,_the_Snake_and_the_Pigeon',
    '机器人之梦': 'Robot_Dreams',
    'Her': 'Her_(film)',
    'Princess mononoke': 'Princess_Mononoke',
    '千与千寻': 'Spirited_Away',
    'inside out2': 'Inside_Out_2',
    '12 angry men': '12_Angry_Men_(1957_film)',
    'Divergent': 'Divergent_(film)',
    '你想活出怎样的人生': 'How_Do_You_Live_(film)',
    '好东西': 'Her_Story_(film)',
    'the wicked': 'Wicked_(film)',
    'the holdovers': 'The_Holdovers',
    'moon': 'Moon_(2009_film)',
    'La La Land': 'La_La_Land',
    'Brooklyn': 'Brooklyn_(film)',
    '哈尔的移动城堡': 'Howl%27s_Moving_Castle_(film)',
    '哪吒2': 'Ne_Zha_2',
    'Flow': 'Flow_(2024_film)',
    '心迷宫': 'The_Maze_(2014_film)',
    'Parent trap': 'The_Parent_Trap_(1998_film)',
    'Alice in wonderland': 'Alice_in_Wonderland_(1951_film)',
    'Big eyes': 'Big_Eyes',
    'the intouchable': 'The_Intouchables',
    'Nosferatu': 'Nosferatu_(2024_film)',
    'before sunrise': 'Before_Sunrise',
    'before midnight': 'Before_Midnight',
    'maze runner': 'The_Maze_Runner_(film)',
    'Penguin lessons': 'The_Penguin_Lessons',
    '芙蓉镇': 'Furong_Town_(film)',
    '死亡诗社': 'Dead_Poets_Society',
    'The Post': 'The_Post_(film)',
    '妈妈咪呀': 'Mamma_Mia!_(film)',
    "Ocean's 8": 'Ocean%27s_8',
    'Zootopia 2': 'Zootopia_2',
    'the big short': 'The_Big_Short_(film)',
    '托斯卡纳艳阳下': 'Under_the_Tuscan_Sun',
    'Heathers': 'Heathers_(film)',
    '七面钟': 'Seven_Faces',
    '10号房的客人': 'Guest_at_Number_10',
    '007皇家赌场': 'Casino_Royale_(2006_film)',
    '007：皇家赌场': 'Casino_Royale_(2006_film)',
    '利刃出鞘': 'Knives_Out_(film)',
    '利刃出鞘2': 'Glass_Onion:_A_Knives_Out_Mystery',
    '利刃出鞘3': 'Wake_Up_Dead_Man',
    '分歧者': 'Divergent_(film)',
    '逃离德黑兰': 'Argo_(2012_film)',
    '怪物': 'Monster_(film)',
};

// Fetch poster from Wikipedia API
function fetchFromWikipedia(title, year) {
    return new Promise((resolve) => {
        let wikiTitle = wikipediaTitles[title] || title;
        wikiTitle = encodeURIComponent(wikiTitle.replace(/\s+/g, '_'));
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`;
        
        const req = https.get(url, {
            timeout: 8000,
            headers: { 'User-Agent': 'MovieGallery/1.0 (rockymarine@example.com)' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.thumbnail && result.thumbnail.source) {
                        resolve(result.originalimage?.source || result.thumbnail.source);
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

function getGradient(title) {
    const gradients = [
        ['1a237e', '283593'], ['2e7d32', '388e3c'], ['c62828', 'd32f2f'],
        ['4a148c', '7b1fa2'], ['e65100', 'ff9800'], ['006064', '00bcd4'],
        ['3e2723', '6d4c41'], ['33691e', '689f38'], ['ad1457', 'f06292'],
        ['263238', '546e7a'], ['1565c0', '42a5f5'], ['5e35b1', '7e57c2'],
    ];
    const hash = title.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const idx = Math.abs(hash) % gradients.length;
    return gradients[idx];
}

function createFallbackPoster(title, year) {
    const [bg1, bg2] = getGradient(title);
    const shortTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
    const text = encodeURIComponent(`${shortTitle}\n(${year})`);
    return `https://placehold.co/200x300/${bg1},${bg2}/ffffff?text=${text}&font=roboto&fontSize=12`;
}

async function fetchAllPosters() {
    console.log(`Fetching posters from Wikipedia for ${movies.length} movies...\n`);
    
    let wiki = 0;
    let fallback = 0;
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        
        if (movie.poster && movie.poster.includes('upload.wikimedia.org')) {
            wiki++;
            continue;
        }
        
        console.log(`[${i + 1}/${movies.length}] ${movie.title}...`);
        
        const posterUrl = await fetchFromWikipedia(movie.title, movie.year);
        
        if (posterUrl) {
            movie.poster = posterUrl;
            wiki++;
            console.log(`  ✓ Wikipedia`);
        } else {
            movie.poster = createFallbackPoster(movie.title, movie.year);
            fallback++;
            console.log(`  ✗ Fallback`);
        }
        
        await sleep(DELAY_MS);
        
        if ((i + 1) % 25 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`\n--- Progress: ${wiki} Wikipedia, ${fallback} fallback ---\n`);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    console.log(`\nDone! ${wiki} Wikipedia, ${fallback} fallback`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllPosters().catch(console.error);
