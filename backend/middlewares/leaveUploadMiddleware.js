import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const uploadDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'assets', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
        cb(null, `${unique}${path.extname(file.originalname)}`)
    },
})

const leaveUpload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })
export default leaveUpload
