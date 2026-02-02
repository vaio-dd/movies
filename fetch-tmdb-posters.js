#!/usr/bin/env node
/**
 * Movie Poster Fetcher using TMDB API
 */

const fs = require('fs');
const https = require('https');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

// TMDB API key from Rocky
const TMDB_API_KEY = '9cdd974964ff636a4400576b4000e59f';

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Title translations for better search
const searchTitles = {
    '小森林—春夏、秋冬': { title: 'Little Forest', year: 2014 },
    '疯狂动物城': { title: 'Zootopia', year: 2016 },
    '蜘蛛侠-平行宇宙': { title: 'Spider-Man: Into the Spider-Verse', year: 2018 },
    '2012': { title: '2012', year: 2009 },
    '后天': { title: 'The Day After Tomorrow', year: 2004 },
    '超人总动员': { title: 'The Incredibles', year: 2004 },
    '驯龙高手1': { title: 'How to Train Your Dragon', year: 2010 },
    'Toys 4': { title: 'Toy Story 4', year: 2019 },
    '流浪地球': { title: 'The Wandering Earth', year: 2019 },
    '当幸福来敲门': { title: 'The Pursuit of Happyness', year: 2006 },
    'I Robot': { title: 'I, Robot', year: 2004 },
    'Legend': { title: 'Legend', year: 2015 },
    '黑衣人1、2': { title: 'Men in Black', year: 1997 },
    '哪吒': { title: 'Ne Zha', year: 2019 },
    '阿甘正传': { title: 'Forrest Gump', year: 1994 },
    '怦然心动': { title: 'Flipped', year: 2010 },
    '少年派的奇幻漂流': { title: 'Life of Pi', year: 2012 },
    '头号玩家': { title: 'Ready Player One', year: 2018 },
    '盗梦空间': { title: 'Inception', year: 2010 },
    '禁闭岛': { title: 'Shutter Island', year: 2010 },
    '双子杀手': { title: 'Gemini Man', year: 2019 },
    '泰坦尼克号': { title: 'Titanic', year: 1997 },
    '冰雪奇缘2': { title: 'Frozen II', year: 2019 },
    '楚门的世界': { title: 'The Truman Show', year: 1998 },
    '致命魔术': { title: 'The Prestige', year: 2006 },
    '小妇人': { title: 'Little Women', year: 2019 },
    '心灵捕手': { title: 'Good Will Hunting', year: 1997 },
    '精灵旅社': { title: 'Hotel Transylvania', year: 2012 },
    '贫民窟里的百万富翁': { title: 'Slumdog Millionaire', year: 2008 },
    '黑客帝国1': { title: 'The Matrix', year: 1999 },
    '新龙门客栈': { title: 'New Dragon Gate Inn', year: 1992 },
    '海蒂和爷爷': { title: 'Heidi', year: 2015 },
    'JOJO RABBIT': { title: 'Jojo Rabbit', year: 2019 },
    '罗马假日': { title: 'Roman Holiday', year: 1953 },
    'mean girl': { title: 'Mean Girls', year: 2004 },
    '独立日': { title: 'Independence Day', year: 1996 },
    '安妮日记': { title: 'The Diary of Anne Frank', year: 2009 },
    'AI': { title: 'A.I. Artificial Intelligence', year: 2001 },
    '傲慢与偏见': { title: 'Pride and Prejudice', year: 2005 },
    '理智与情感': { title: 'Sense and Sensibility', year: 1995 },
    '爱玛': { title: 'Emma', year: 1996 },
    '超体': { title: 'Lucy', year: 2014 },
    '乱世佳人': { title: 'Gone with the Wind', year: 1939 },
    '勇敢者的游戏': { title: 'Jumanji', year: 1995 },
    '花木兰2020': { title: 'Mulan', year: 2020 },
    '三傻大闹宝莱坞': { title: '3 Idiots', year: 2009 },
    '火星救援': { title: 'The Martian', year: 2015 },
    '谍影重重': { title: 'The Bourne Identity', year: 2002 },
    '爱与怪物': { title: 'Love and Monster', year: 2020 },
    '菊次郎的夏天': { title: 'Kikujiro', year: 1999 },
    '微光城市': { title: 'City of Ember', year: 2008 },
    '垫底辣妹': { title: 'Biri Girl', year: 2015 },
    '信条': { title: 'Tenet', year: 2020 },
    '大白鲨': { title: 'Jaws', year: 1975 },
    '灵魂': { title: 'Soul', year: 2020 },
    '疯狂原始人2': { title: 'The Croods: A New Age', year: 2020 },
    '无人生还': { title: 'And Then There Were None', year: 2015 },
    '灰猎犬号': { title: 'Greyhound', year: 2020 },
    'coranline': { title: 'Coraline', year: 2009 },
    '猫鼠游戏': { title: 'Catch Me If You Can', year: 2002 },
    '纵横四海': { title: 'Once a Thief', year: 1996 },
    '小鬼当家': { title: 'Home Alone', year: 1990 },
    '蓝风筝': { title: 'The Blue Kite', year: 1993 },
    '海上钢琴师': { title: 'The Legend of 1900', year: 1998 },
    '尼罗河上的惨案': { title: 'Death on the Nile', year: 2022 },
    '看不见的客人': { title: 'The Invisible Guest', year: 2016 },
    '阳光下的罪恶': { title: 'Evil Under the Sun', year: 1982 },
    '魔戒1': { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001 },
    '沉睡魔咒': { title: 'Maleficent', year: 2014 },
    '角斗士': { title: 'Gladiator', year: 2000 },
    '教父': { title: 'The Godfather', year: 1972 },
    '珍珠港': { title: 'Pearl Harbor', year: 2001 },
    '情书': { title: 'Love Letter', year: 1995 },
    '侏罗纪公园': { title: 'Jurassic Park', year: 1993 },
    '达芬奇密码': { title: 'The Da Vinci Code', year: 2006 },
    '蝴蝶效应': { title: 'The Butterfly Effect', year: 2004 },
    '致命ID': { title: 'Identity', year: 2003 },
    '你的名字': { title: 'Your Name', year: 2016 },
    '无间道': { title: 'Infernal Affairs', year: 2002 },
    '源代码': { title: 'Source Code', year: 2011 },
    '弱点': { title: 'The Blind Side', year: 2009 },
    '小岛惊魂': { title: 'The Others', year: 2001 },
    '尚气和十环传奇': { title: 'Shang-Chi and the Legend of the Ten Rings', year: 2021 },
    '恐怖游轮': { title: 'Triangle', year: 2009 },
    '雨人': { title: 'Rain Man', year: 1988 },
    '沙丘': { title: 'Dune', year: 2021 },
    '社交网络': { title: 'The Social Network', year: 2010 },
    '疯狂的石头': { title: 'Crazy Stone', year: 2006 },
    '魔女宅急便': { title: "Kiki's Delivery Service", year: 1989 },
    '荒岛余生': { title: 'Cast Away', year: 2000 },
    '不要抬头': { title: "Don't Look Up", year: 2021 },
    '圣诞夜惊魂': { title: 'The Nightmare Before Christmas', year: 1993 },
    '幸福终点站': { title: 'The Terminal', year: 2004 },
    '芬奇': { title: 'Finch', year: 2021 },
    '你好，李焕英': { title: 'Hi, Mom', year: 2021 },
    '记忆碎片': { title: 'Memento', year: 2000 },
    '十二猴子': { title: '12 Monkeys', year: 1995 },
    '犬之力': { title: 'The Power of the Dog', year: 2021 },
    '闪灵': { title: 'The Shining', year: 1980 },
    '飞跃疯人院': { title: 'One Flew Over the Cuckoo\'s Nest', year: 1975 },
    '何以为家': { title: 'Capernaum', year: 2018 },
    '海市蜃楼': { title: 'Mirage', year: 2018 },
    'CODA': { title: 'CODA', year: 2021 },
    'Wall-E': { title: 'WALL-E', year: 2008 },
    '瞬息全宇宙': { title: 'Everything Everywhere All at Once', year: 2022 },
    '消失的爱人': { title: 'Gone Girl', year: 2014 },
    '本杰明·巴顿奇事': { title: 'The Curious Case of Benjamin Button', year: 2008 },
    '天鹅挽歌': { title: 'Swan Song', year: 2021 },
    '饥饿游戏': { title: 'The Hunger Games', year: 2012 },
    '风声': { title: 'The Message', year: 2009 },
    '红辣椒': { title: 'Paprika', year: 2006 },
    '地心引力': { title: 'Gravity', year: 2013 },
    '让子弹飞': { title: 'Let the Bullets Fly', year: 2010 },
    'Avatar2': { title: 'Avatar: The Way of Water', year: 2022 },
    '大话西游1': { title: 'A Chinese Odyssey Part One: Cinderella', year: 1995 },
    '大话西游2': { title: 'A Chinese Odyssey Part Two: Sphinx', year: 1995 },
    '龙纹身女孩': { title: 'The Girl with the Dragon Tattoo', year: 2011 },
    '七号房的礼物': { title: 'Miracle in Cell No. 7', year: 2013 },
    '冰血暴': { title: 'Fargo', year: 1996 },
    '马里奥': { title: 'The Super Mario Bros. Movie', year: 2023 },
    '敦刻尔克': { title: 'Dunkirk', year: 2017 },
    '芭比': { title: 'Barbie', year: 2023 },
    '奥本海默': { title: 'Oppenheimer', year: 2023 },
    '穿prada的恶魔': { title: 'The Devil Wears Prada', year: 2006 },
    '封神第一部': { title: 'Creation of the Gods', year: 2023 },
    '夜访吸血鬼': { title: 'Interview with the Vampire', year: 1994 },
    'past lives': { title: 'Past Lives', year: 2023 },
    '花月杀手': { title: 'Killers of the Flower Moon', year: 2023 },
    '周处除三害': { title: 'The Pig, the Snake and the Pigeon', year: 2024 },
    '机器人之梦': { title: 'Robot Dreams', year: 2023 },
    'Her': { title: 'Her', year: 2013 },
    'Princess mononoke': { title: 'Princess Mononoke', year: 1997 },
    '千与千寻': { title: 'Spirited Away', year: 2001 },
    'inside out2': { title: 'Inside Out 2', year: 2024 },
    '12 angry men': { title: '12 Angry Men', year: 1957 },
    'Divergent': { title: 'Divergent', year: 2014 },
    '你想活出怎样的人生': { title: 'How Do You Live', year: 2023 },
    '好东西': { title: 'Her Story', year: 2024 },
    'the wicked': { title: 'Wicked', year: 2024 },
    'the holdovers': { title: 'The Holdovers', year: 2023 },
    'moon': { title: 'Moon', year: 2009 },
    'La La Land': { title: 'La La Land', year: 2016 },
    'Brooklyn': { title: 'Brooklyn', year: 2015 },
    '哈尔的移动城堡': { title: 'Howl\'s Moving Castle', year: 2004 },
    '哪吒2': { title: 'Ne Zha 2', year: 2025 },
    '心迷宫': { title: 'Chronic', year: 2015 },
    'Parent trap': { title: 'The Parent Trap', year: 1998 },
    'Alice in wonderland': { title: 'Alice in Wonderland', year: 1951 },
    'Big eyes': { title: 'Big Eyes', year: 2014 },
    'the intouchable': { title: 'The Intouchables', year: 2011 },
    'Nosferatu': { title: 'Nosferatu', year: 2024 },
    'before sunrise': { title: 'Before Sunrise', year: 1995 },
    'before midnight': { title: 'Before Midnight', year: 2013 },
    'maze runner': { title: 'The Maze Runner', year: 2014 },
    'Penguin lessons': { title: 'The Penguin Lessons', year: 2024 },
    '芙蓉镇': { title: 'Furong Town', year: 1987 },
    '死亡诗社': { title: 'Dead Poets Society', year: 1989 },
    'The Post': { title: 'The Post', year: 2017 },
    '妈妈咪呀': { title: 'Mamma Mia!', year: 2008 },
    "Ocean's 8": { title: 'Ocean\'s 8', year: 2018 },
    'Zootopia 2': { title: 'Zootopia 2', year: 2023 },
    'the big short': { title: 'The Big Short', year: 2015 },
    '托斯卡纳艳阳下': { title: 'Under the Tuscan Sun', year: 2003 },
    'Heathers': { title: 'Heathers', year: 1989 },
    '七面钟': { title: 'Seven Faces', year: 1959 },
    '10号房的客人': { title: 'Guest at Number 10', year: 2025 },
    '007皇家赌场': { title: 'Casino Royale', year: 2006 },
    '007：皇家赌场': { title: 'Casino Royale', year: 2006 },
    '利刃出鞘': { title: 'Knives Out', year: 2019 },
    '利刃出鞘2': { title: 'Glass Onion: A Knives Out Mystery', year: 2022 },
    '利刃出鞘3': { title: 'Wake Up Dead Man', year: 2024 },
    '分歧者': { title: 'Divergent', year: 2014 },
    '逃离德黑兰': { title: 'Argo', year: 2012 },
};

// Fetch poster from TMDB
function fetchFromTMDB(title, year) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(title);
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&year=${year}`;
        
        const req = https.get(url, { timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.results && result.results.length > 0 && result.results[0].poster_path) {
                        const posterUrl = `https://image.tmdb.org/t/p/w500${result.results[0].poster_path}`;
                        resolve(posterUrl);
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

// Gradient fallback
function getGradient(title) {
    const gradients = [
        ['1a237e', '283593'], ['2e7d32', '388e3c'], ['c62828', 'd32f2f'],
        ['4a148c', '7b1fa2'], ['e65100', 'ff9800'], ['006064', '00bcd4'],
    ];
    const hash = title.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    return gradients[Math.abs(hash) % gradients.length];
}

function createFallback(title, year) {
    const [bg1, bg2] = getGradient(title);
    const shortTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
    const text = encodeURIComponent(`${shortTitle}\n(${year})`);
    return `https://placehold.co/200x300/${bg1},${bg2}/ffffff?text=${text}&font=roboto&fontSize=12`;
}

async function fetchAllPosters() {
    console.log(`Fetching TMDB posters for ${movies.length} movies...\n`);
    
    let tmdb = 0;
    let fallback = 0;
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        
        // Skip if already has TMDB poster
        if (movie.poster && movie.poster.includes('image.tmdb.org')) {
            tmdb++;
            if ((i + 1) % 25 === 0) {
                console.log(`[${i + 1}/${movies.length}] ${movie.title} - TMDB poster`);
            }
            continue;
        }
        
        console.log(`[${i + 1}/${movies.length}] ${movie.title} (${movie.year})...`);
        
        // Get search query
        const searchInfo = searchTitles[movie.title] || { title: movie.title, year: movie.year };
        const posterUrl = await fetchFromTMDB(searchInfo.title, searchInfo.year);
        
        if (posterUrl) {
            movie.poster = posterUrl;
            tmdb++;
            console.log(`  ✓ TMDB poster found`);
        } else {
            movie.poster = createFallback(movie.title, movie.year);
            fallback++;
            console.log(`  ✗ Using fallback`);
        }
        
        // Rate limit
        await sleep(250);
        
        // Save progress
        if ((i + 1) % 25 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`\n--- Progress: ${tmdb} TMDB, ${fallback} fallback ---\n`);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    const unique = [...new Set(movies.map(m => m.poster))];
    
    console.log(`\n========================================`);
    console.log(`Done!`);
    console.log(`  - TMDB posters: ${tmdb}`);
    console.log(`  - Fallback: ${fallback}`);
    console.log(`  - Unique: ${unique.length}`);
    console.log(`========================================\n`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllPosters().catch(console.error);
