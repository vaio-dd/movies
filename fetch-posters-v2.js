#!/usr/bin/env node
/**
 * Movie Poster Fetcher - Improved version
 * Uses multiple search strategies for better results
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

const DATA_FILE = './data/movies.json';
const OUTPUT_FILE = './data/movies.json';

const DELAY_MS = 250;
const MAX_RETRIES = 2;

let movies = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// Known title translations for better search
const titleTranslations = {
    '小森林—春夏、秋冬': 'Little Forest',
    '疯狂动物城': 'Zootopia 2016',
    '蜘蛛侠-平行宇宙': 'Spider-Man Into the Spider-Verse 2018',
    '2012': '2012 2009',
    '后天': 'The Day After Tomorrow 2004',
    '超人总动员': 'Incredibles 2004',
    '驯龙高手1': 'How to Train Your Dragon 2010',
    'Toys 4': 'Toy Story 4 2019',
    '流浪地球': 'Wandering Earth 2019',
    '当幸福来敲门': 'Pursuit of Happyness 2006',
    'I Robot': 'I Robot 2004',
    'Legend': 'Legend 2015',
    '黑衣人1、2': 'Men in Black 1997',
    '哪吒': 'Ne Zha 2019',
    '阿甘正传': 'Forrest Gump 1994',
    '怦然心动': 'Flipped 2010',
    '少年派的奇幻漂流': 'Life of Pi 2012',
    '头号玩家': 'Ready Player One 2018',
    '盗梦空间': 'Inception 2010',
    '禁闭岛': 'Shutter Island 2010',
    '双子杀手': 'Gemini Man 2019',
    '泰坦尼克号': 'Titanic 1997',
    '冰雪奇缘2': 'Frozen 2 2019',
    '楚门的世界': 'Truman Show 1998',
    '致命魔术': 'Prestige 2006',
    '小妇人': 'Little Women 2019',
    '心灵捕手': 'Good Will Hunting 1997',
    '精灵旅社': 'Hotel Transylvania 2012',
    '贫民窟里的百万富翁': 'Slumdog Millionaire 2008',
    '黑客帝国1': 'Matrix 1999',
    '新龙门客栈': 'New Dragon Gate Inn 1992',
    '海蒂和爷爷': 'Heidi 2015',
    'JOJO RABBIT': 'Jojo Rabbit 2019',
    '罗马假日': 'Roman Holiday 1953',
    'mean girl': 'Mean Girls 2004',
    '独立日': 'Independence Day 1996',
    '安妮日记': 'Diary of Anne Frank 2009',
    'AI': 'AI Artificial Intelligence 2001',
    '傲慢与偏见': 'Pride and Prejudice 2005',
    '理智与情感': 'Sense and Sensibility 1995',
    '爱玛': 'Emma 1996',
    '超体': 'Lucy 2014',
    '乱世佳人': 'Gone with the Wind 1939',
    '勇敢者的游戏': 'Jumanji 1995',
    '花木兰2020': 'Mulan 2020',
    '三傻大闹宝莱坞': '3 Idiots 2009',
    '火星救援': 'Martian 2015',
    '谍影重重': 'Bourne Identity 2002',
    '甜蜜蜜': 'Comrades Almost a Love Story 1996',
    '爱与怪物': 'Love and Monster 2020',
    '菊次郎的夏天': 'Kikujiro 1999',
    '微光城市': 'City of Ember 2008',
    '垫底辣妹': 'Biri Girl 2015',
    '信条': 'Tenet 2020',
    '大白鲨': 'Jaws 1975',
    '灵魂': 'Soul 2020',
    '疯狂原始人2': 'Croods 2 2020',
    '无人生还': 'And Then There Were None 2015',
    '灰猎犬号': 'Greyhound 2020',
    'coranline': 'Coraline 2009',
    '猫鼠游戏': 'Catch Me If You Can 2002',
    '纵横四海': 'Once a Thief 1996',
    '小鬼当家': 'Home Alone 1990',
    '蓝风筝': 'Blue Kite 1993',
    '海上钢琴师': 'Legend of 1900 1998',
    '尼罗河上的惨案': 'Death on the Nile 2022',
    '看不见的客人': 'Invisible Guest 2016',
    '阳光下的罪恶': 'Evil Under the Sun 1982',
    '魔戒1': 'Lord of the Rings Fellowship 2001',
    '沉睡魔咒': 'Maleficent 2014',
    '角斗士': 'Gladiator 2000',
    '教父': 'Godfather 1972',
    '珍珠港': 'Pearl Harbor 2001',
    '情书': 'Love Letter 1995',
    '侏罗纪公园': 'Jurassic Park 1993',
    '达芬奇密码': 'Da Vinci Code 2006',
    '蝴蝶效应': 'Butterfly Effect 2004',
    '致命ID': 'Identity 2003',
    '你的名字': 'Your Name 2016',
    '无间道': 'Infernal Affairs 2002',
    '源代码': 'Source Code 2011',
    '弱点': 'Blind Side 2009',
    '小岛惊魂': 'Others 2001',
    '尚气和十环传奇': 'Shang-Chi 2021',
    '恐怖游轮': 'Triangle 2009',
    '雨人': 'Rain Man 1988',
    '沙丘': 'Dune 2021',
    '社交网络': 'Social Network 2010',
    '疯狂的石头': 'Crazy Stone 2006',
    '魔女宅急便': 'Kikis Delivery Service 1989',
    '荒岛余生': 'Cast Away 2000',
    '不要抬头': 'Dont Look Up 2021',
    '圣诞夜惊魂': 'Nightmare Before Christmas 1993',
    '幸福终点站': 'Terminal 2004',
    '芬奇': 'Finch 2021',
    '你好，李焕英': 'Hi Mom 2021',
    '爱情神话': 'B神话',
    '雄狮少年': 'Roaring Grasslands 2021',
    '记忆碎片': 'Memento 2000',
    '十二猴子': '12 Monkeys 1995',
    '犬之力': 'Power of the Dog 2021',
    '闪灵': 'Shining 1980',
    '飞跃疯人院': 'One Flew Over Cuckoos Nest 1975',
    '何以为家': 'Capernaum 2018',
    '海市蜃楼': 'Mirage 2018',
    'CODA': 'CODA 2021',
    'Wall-E': 'WALL-E 2008',
    '瞬息全宇宙': 'Everything Everywhere All at Once 2022',
    '消失的爱人': 'Gone Girl 2014',
    '本杰明·巴顿奇事': 'Benjamin Button 2008',
    '天鹅挽歌': 'Swan Song 2021',
    '饥饿游戏': 'Hunger Games 2012',
    '风声': 'Message 2009',
    '红辣椒': 'Paprika 2006',
    '地心引力': 'Gravity 2013',
    '让子弹飞': 'Let Bullets Fly 2010',
    'Avatar2': 'Avatar Way of Water 2022',
    '大话西游1': 'Chinese Odyssey 1995',
    '大话西游2': 'Chinese Odyssey 1995',
    '龙纹身女孩': 'Girl with Dragon Tattoo 2011',
    '七号房的礼物': 'Miracle in Cell No 7 2013',
    '冰血暴': 'Fargo 1996',
    '马里奥': 'Super Mario Bros 2023',
    '敦刻尔克': 'Dunkirk 2017',
    '芭比': 'Barbie 2023',
    '奥本海默': 'Oppenheimer 2023',
    '穿prada的恶魔': 'Devil Wears Prada 2006',
    '花束般的恋爱': 'My Late Girlfriend 2021',
    '长安三万里': 'Chang An 2023',
    '封神第一部': 'Creation of Gods 2023',
    '夜访吸血鬼': 'Interview with Vampire 1994',
    'past lives': 'Past Lives 2023',
    '花月杀手': 'Killers Flower Moon 2023',
    '周处除三害': 'Pige Snake 2024',
    '机器人之梦': 'Robot Dreams 2023',
    'Her': 'Her 2013',
    'Princess mononoke': 'Princess Mononoke 1997',
    '千与千寻': 'Spirited Away 2001',
    'inside out2': 'Inside Out 2 2024',
    '12 angry men': '12 Angry Men 1957',
    'Divergent': 'Divergent 2014',
    '你想活出怎样的人生': 'How Do You Live 2023',
    '好东西': 'Her Story 2024',
    'the wicked': 'Wicked 2024',
    'the holdovers': 'Holdovers 2023',
    'moon': 'Moon 2009',
    'La La Land': 'La La Land 2016',
    'Brooklyn': 'Brooklyn 2015',
    '哈尔的移动城堡': 'Howls Moving Castle 2004',
    '哪吒2': 'Ne Zha 2 2025',
    'Flow': 'Flow 2024',
    '心迷宫': 'Chronic 2015',
    'Parent trap': 'Parent Trap 1998',
    'Alice in wonderland': 'Alice in Wonderland 1951',
    'Big eyes': 'Big Eyes 2014',
    'the intouchable': 'Intouchables 2011',
    'Nosferatu': 'Nosferatu 2024',
    'before sunrise': 'Before Sunrise 1995',
    'before midnight': 'Before Midnight 2013',
    'maze runner': 'Maze Runner 2014',
    'Penguin lessons': 'Penguin Lessons 2024',
    '芙蓉镇': 'Furong Town 1987',
    '死亡诗社': 'Dead Poets Society 1989',
    'The Post': 'Post 2017',
    '妈妈咪呀': 'Mamma Mia 2008',
    "Ocean's 8": 'Oceans 8 2018',
    'Zootopia 2': 'Zootopia 2 2023',
    'the big short': 'Big Short 2015',
    '托斯卡纳艳阳下': 'Under Tuscan Sun 2003',
    'Heathers': 'Heathers 1989',
    '七面钟': 'Seven Faces',
    '10号房的客人': 'Guest at Number 10 2025',
    '007皇家赌场': 'Casino Royale 2006',
    '007：皇家赌场': 'Casino Royale 2006',
    '利刃出鞘': 'Knives Out 2019',
    '利刃出鞘2': 'Knives Out 2 2022',
    '利刃出鞘3': 'Knives Out 3 2024',
    '分歧者': 'Divergent 2014',
    '逃离德黑兰': 'Argo 2012',
    '天气': 'The Weather',
    '怪物': 'Monster',
};

function searchIMDb(title, year) {
    return new Promise((resolve) => {
        const searchTitle = titleTranslations[title] || `${title} ${year} movie`;
        const query = encodeURIComponent(searchTitle);
        const url = `https://v2.sg.media-imdb.com/suggestion/p/${query}.json`;
        
        const req = https.get(url, { timeout: 8000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (results && results.length > 0 && results[0].i) {
                        const imageId = results[0].i.imageUrl.split('/').pop();
                        const posterUrl = `https://m.media-amazon.com/images/M/${imageId}`;
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

async function fetchAllPosters() {
    console.log(`Fetching unique posters for ${movies.length} movies...\n`);
    
    let updated = 0;
    let failed = 0;
    let alreadyCorrect = 0;
    
    // Track used posters
    const usedPosters = new Set();
    
    for (let i = 0; i < movies.length; i++) {
        const movie = movies[i];
        
        // Check if we already have a unique poster for this movie
        const poster = movie.poster || '';
        if (poster.includes('m.media-amazon.com') && !poster.includes('placehold.co')) {
            // This movie has a poster URL - check if it's unique
            // For now, accept it if it's a real IMDb URL
            alreadyCorrect++;
            if ((i + 1) % 25 === 0) {
                console.log(`[${i + 1}/${movies.length}] ${movie.title}`);
            }
            continue;
        }
        
        console.log(`[${i + 1}/${movies.length}] ${movie.title} (${movie.year})...`);
        
        let posterUrl = null;
        for (let retry = 0; retry < MAX_RETRIES && !posterUrl; retry++) {
            posterUrl = await searchIMDb(movie.title, movie.year);
            if (posterUrl && usedPosters.has(posterUrl)) {
                // Try again if poster is already used
                posterUrl = null;
            }
            if (!posterUrl && retry < MAX_RETRIES - 1) {
                await sleep(500);
            }
        }
        
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
        
        // Save progress
        if ((i + 1) % 25 === 0) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
            console.log(`\n--- Progress: ${updated} new, ${alreadyCorrect} existing, ${failed} failed ---\n`);
        }
    }
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(movies, null, 2));
    
    // Count unique posters
    const uniquePosters = new Set(movies.map(m => m.poster).filter(p => p));
    
    console.log(`\n========================================`);
    console.log(`Done!`);
    console.log(`  - Unique posters: ${uniquePosters.size}`);
    console.log(`  - Updated: ${updated}`);
    console.log(`  - Already had: ${alreadyCorrect}`);
    console.log(`  - Failed: ${failed}`);
    console.log(`========================================\n`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

fetchAllPosters().catch(console.error);
