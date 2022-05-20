// Variables
let goal_frame = 300 // 5sec * 50fps = 300 frames
let step = 0.4 // The step of radius between frames
let change = 40 // Die Schnelligkeit mit der die Kreise wechseln

let stop = false

const app = require('express')()
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})

const http = require('http').Server(app)
const io = require('socket.io')(http)

let coords = []

for (var i = 0; i < 200; i++) {
    coords.push({
        x: Math.random() * 100,
        y: Math.random() * 100
    })
}

let started = false
app.get('/', (req, res) => { res.sendFile(__dirname + '/ui/index.html') })
app.get('/:file', (req, res) => { res.sendFile(__dirname + '/ui/' + req.params.file) })
app.get('/api/coords', (req, res) => { res.send(coords) })
app.get('/static/:file', (req, res) => { res.sendFile(__dirname + `/static/${req.params.file}`) })

io.on('connection', (socket) => {
    socket.on ('start', () => {
        if (started) { return }
        started = true
        start()
    })
    socket.on('vars', (data) => {
        console.log(data)
        if (data.goal != '')
            goal_frame = parseInt(data.goal)
        if (data.step != '')
            step = parseInt(data.step)
        if (data.change != '')
            change = parseInt(data.change)
        console.log(goal_frame, step, change)
    })
    socket.on('stop', () => {
        stop = true
        io.emit('stop', true)
    })
    socket.on('open', () => {
        require('child_process').exec('start ' + __dirname + '\\videos')
    })
})

// Import fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const path = require('path')

const cliProgress = require('cli-progress')
const b1 = new cliProgress.SingleBar({
    // Format the bar that i can see the current task
    format: '{index}/{totali} |{bar}| {value} of {total} Frames ({percentage}%) | {name}',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
 }, cliProgress.Presets.shades_classic)

// Gets the input json file
const fs = require('fs')
const input = fs.readFileSync('./.input/input.json', 'utf8')
const json = JSON.parse(input)

const ffmpeg = require('fluent-ffmpeg')

// Launches virtual browser
const puppeteer = require('puppeteer')
const { SocketAddress } = require('net')
let browser
puppeteer.launch().then(res => {
    browser = res
    console.log('Browser launched')
    // start()
})

async function takeScreenshot(name, color_one, color_two, ro, frame, both, wich) {
    const page = await browser.newPage()
    const joink = both?'ja':'nein'
    await page.goto(`http://localhost:3000/static/index.html?ca=${color_one}&cb=${color_two}&ro=${ro}&co=${joink}&wi=${wich}`)
    // Wait 100ms
    await page.waitForSelector('#finished')
    await page.screenshot({ path: `./.output/${name}/frame_${frame}.jpeg` })
    await page.close()
}

const rgbToHex =  (r, g, b) => ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)

const c_one = rgbToHex(json.colors[0][0], json.colors[0][1], json.colors[0][2])
const c_one_h = rgbToHex(json.colors[1][0], json.colors[1][1], json.colors[1][2])
const c_two = rgbToHex(json.colors[2][0], json.colors[2][1], json.colors[2][2])
const c_two_h = rgbToHex(json.colors[3][0], json.colors[3][1], json.colors[3][2])

function check (nm, bool, frame) {
    let color = bool ? c_one : c_two
    if (nm == null) 
        color = bool ? c_one : c_two
    else {
        nm.forEach(he => {
            let ml = (frame / (goal_frame / 5)) * 1000
            if (ml >= he * 100 && ml <= (he * 100) + 100)
                color = bool ? c_one_h : c_two_h
        })
    }
    return color
}

function check_c (nm, frame) {
    let show = false
    if (nm != null) {
        nm.forEach(he => {
            let ml = (frame / (goal_frame / 5)) * 1000
            if (ml >= he * 100 && ml <= (he * 100) + 100)
                show = true
        })
    }
    return show
}

if (!fs.existsSync('./.output')) {
    fs.mkdirSync('./.output')
    console.log(' Created missing output folder')
}
const odir = `./videos/`
if (!fs.existsSync(odir))
    fs.mkdirSync(odir)

// Start frame process
async function start() {
    // Go through the json file and takes all videos
    let index = 0
    b1.start(goal_frame, 0)
    process(json.files[index])
    async function process (file) {
        let frame = 1 // The current frame number
        let radius = 0 // The current radius
        let wich = true 
        const name = file.name
        const dir = `./.output/${name}`
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir)
        for (var i = 0; i < goal_frame; i++) {
            radius += step
            if (i % change == 0 && i != 0)
                wich = !wich
            await takeScreenshot(name, check(file.NM1, true, frame), check(file.NM2, false, frame), radius, frame, check_c(file.NIC, frame), wich)
            b1.update(i, {
                index: index + 1,
                totali: json.files.length,
                name: name,
                total: 300
            })
            if (stop) return
            const base64 = fs.readFileSync(`./.output/${name}/frame_${frame}.jpeg`, 'base64')
            let progress = (i / goal_frame) * 100
            io.emit('progress', { progress: progress, image: base64, current: (index + 1) + '/' + json.files.length })
            frame++
        }
        b1.update(goal_frame)

        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
        var ffmpeg = require('fluent-ffmpeg')
        ffmpeg.setFfmpegPath(ffmpegPath)
        // Convert all images to one video
        ffmpeg('./.output/' + name + '/frame_%d.jpeg')
            .output(__dirname + `\\videos\\${name}.mp4`, {
                vcodec: 'libx264', 
                pix_fmt: 'yuv420p',
            })
            .noAudio()
            .duration(5)
            .inputFPS(60)
            .outputOptions([
                '-r', (goal_frame / 5),
                '-s', 'hd1080'
            ])
            .on('start', function (commandLine) {
                // console.log('\nSpawned Ffmpeg with command: ' + commandLine)
            }).on('error', function (err) {
                console.log('\nAn error occurred: ' + err.message)
            }).on('end', function () {
                index++
                if (json.files[index])
                    process(json.files[index])
                else {
                    b1.stop()
                    console.log('Done')
                }
            }).run()
    }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
})

http.listen(3000, () => console.log('Auvi listening on port 3000!'))