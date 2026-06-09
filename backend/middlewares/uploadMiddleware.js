import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'assets', 'uploads'),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`
        cb(null, `${unique}${path.extname(file.originalname)}`)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
})

export default upload
