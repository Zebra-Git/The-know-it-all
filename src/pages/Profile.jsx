import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { achievements } from '../data/achievements'

const MotionPaper = motion(Paper)
const MotionCard = motion(Card)

function Profile() {
    const navigate = useNavigate()
    const { currentUser, deleteAccount } = useAuth()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [openDialog, setOpenDialog] = useState(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }

        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
                if (userDoc.exists()) {
                    setUserData(userDoc.data())
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных пользователя:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [currentUser, navigate])

    const handleDeleteAccount = async () => {
        setError('')
        setLoading(true)

        try {
            await deleteAccount(password)
            navigate('/')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress />
            </Box>
        )
    }

    const userAchievements = userData?.achievements || []
    const unlockedAchievements = achievements.filter(a => userAchievements.includes(a.id))
    const lockedAchievements = achievements.filter(a => !userAchievements.includes(a.id))

    return (
        <Container maxWidth="md">
            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{ p: 4, mt: 4 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'primary.main',
                            fontSize: '2.5rem',
                        }}
                    >
                        {userData?.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ ml: 3 }}>
                        <Typography variant="h4" component="h1">
                            {userData?.username}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {userData?.email}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <MotionCard
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Статистика
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {userData?.score || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Всего очков
                                </Typography>
                            </CardContent>
                        </MotionCard>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <MotionCard
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Достижения
                                </Typography>
                                <Typography variant="h4" color="primary">
                                    {userAchievements.length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Получено достижений
                                </Typography>
                            </CardContent>
                        </MotionCard>
                    </Grid>

                    <Grid item xs={12}>
                        <MotionCard
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Список достижений
                                </Typography>
                                <List>
                                    {unlockedAchievements.map((achievement) => (
                                        <ListItem key={achievement.id}>
                                            <ListItemIcon>
                                                <Typography variant="h5">{achievement.icon}</Typography>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={achievement.title}
                                                secondary={achievement.description}
                                            />
                                        </ListItem>
                                    ))}
                                    <Divider />
                                    {lockedAchievements.map((achievement) => (
                                        <ListItem key={achievement.id} sx={{ opacity: 0.5 }}>
                                            <ListItemIcon>
                                                <Typography variant="h5">🔒</Typography>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={achievement.title}
                                                secondary={achievement.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => setOpenDialog(true)}
                    >
                        Удалить аккаунт
                    </Button>
                </Box>
            </MotionPaper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Подтверждение удаления аккаунта</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Для удаления аккаунта введите свой пароль
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Пароль"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
                    <Button
                        onClick={handleDeleteAccount}
                        color="error"
                        disabled={loading}
                    >
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

export default Profile 