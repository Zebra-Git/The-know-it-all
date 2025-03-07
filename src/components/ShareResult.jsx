import { useState } from 'react'
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Box,
} from '@mui/material'
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    WhatsApp as WhatsAppIcon,
    Telegram as TelegramIcon,
    Share as ShareIcon,
} from '@mui/icons-material'

function ShareResult({ score, correctAnswers, totalQuestions }) {
    const [open, setOpen] = useState(false)

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    const shareText = `Я набрал ${score} очков в игре The know-it-all! Правильных ответов: ${correctAnswers} из ${totalQuestions}. Попробуй и ты!`

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`,
    }

    const handleShare = (platform) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    }

    return (
        <>
            <Button
                variant="outlined"
                color="primary"
                onClick={handleOpen}
                startIcon={<ShareIcon />}
            >
                Поделиться результатом
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Поделиться результатом</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        {shareText}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <IconButton
                            onClick={() => handleShare('facebook')}
                            color="primary"
                            size="large"
                        >
                            <FacebookIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleShare('twitter')}
                            color="primary"
                            size="large"
                        >
                            <TwitterIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleShare('whatsapp')}
                            color="primary"
                            size="large"
                        >
                            <WhatsAppIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => handleShare('telegram')}
                            color="primary"
                            size="large"
                        >
                            <TelegramIcon />
                        </IconButton>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Закрыть</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ShareResult 