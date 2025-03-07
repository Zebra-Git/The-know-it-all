import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    LinearProgress,
    Grid,
    Card,
    CardContent,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    Select,
    MenuItem,
    FormControl as MuiFormControl,
    InputLabel,
    AppBar,
    Toolbar
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { questions } from '../data/questions'
import { achievements } from '../data/achievements'
import { useAuth } from '../contexts/AuthContext'
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'
import ShareResult from '../components/ShareResult'
import { Check as CheckIcon, Close as CloseIcon, ArrowForward as ArrowForwardIcon, Logout as LogoutIcon } from '@mui/icons-material'

const MotionPaper = motion(Paper)
const MotionCard = motion(Card)

function Game() {
    const navigate = useNavigate()
    const { currentUser, logout } = useAuth()
    const [selectedCategory, setSelectedCategory] = useState('')
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [loading, setLoading] = useState(true)
    const [startTime, setStartTime] = useState(null)
    const [newAchievement, setNewAchievement] = useState(null)
    const [correctAnswers, setCorrectAnswers] = useState(0)
    const [answers, setAnswers] = useState([])
    const [showReview, setShowReview] = useState(false)
    const [shuffledQuestions, setShuffledQuestions] = useState([])

    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }
        setLoading(false)
    }, [currentUser, navigate])

    const handleCategorySelect = (category) => {
        setSelectedCategory(category)
        // Перемешиваем вопросы выбранной категории
        const categoryQuestions = [...questions[category]]
        for (let i = categoryQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
                ;[categoryQuestions[i], categoryQuestions[j]] = [categoryQuestions[j], categoryQuestions[i]]
        }
        setShuffledQuestions(categoryQuestions)
        setStartTime(Date.now())
    }

    const handleAnswerSelect = (optionIndex) => {
        setSelectedAnswer(optionIndex)
    }

    const checkAchievements = async (userRef, userData) => {
        const newAchievements = []
        const currentAchievements = userData.achievements || []

        achievements.forEach((achievement) => {
            if (!currentAchievements.includes(achievement.id)) {
                if (achievement.id === 'first_win' && score >= achievement.requirement) {
                    newAchievements.push(achievement.id)
                } else if (achievement.id === 'perfect_game' && correctAnswers === shuffledQuestions.length) {
                    newAchievements.push(achievement.id)
                } else if (achievement.id === 'speed_demon' && (Date.now() - startTime) / 1000 < 120) {
                    newAchievements.push(achievement.id)
                } else if (achievement.id === 'knowledge_master' && (userData.score + score) >= achievement.requirement) {
                    newAchievements.push(achievement.id)
                }
            }
        })

        if (newAchievements.length > 0) {
            await updateDoc(userRef, {
                achievements: arrayUnion(...newAchievements),
            })
            setNewAchievement(achievements.find(a => a.id === newAchievements[0]))
        }
    }

    const handleNextQuestion = async () => {
        const isCorrect = selectedAnswer === shuffledQuestions[currentQuestion].correctAnswer
        setAnswers([...answers, {
            question: shuffledQuestions[currentQuestion].question,
            selectedAnswer,
            correctAnswer: shuffledQuestions[currentQuestion].correctAnswer,
            isCorrect
        }])

        if (isCorrect) {
            setScore(score + shuffledQuestions[currentQuestion].points)
            setCorrectAnswers(correctAnswers + 1)
        }

        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(null)
        } else {
            setShowResult(true)
            try {
                const userRef = doc(db, 'users', currentUser.uid)
                const userDoc = await getDoc(userRef)
                const userData = userDoc.data()
                const currentScore = userData.score || 0

                await updateDoc(userRef, {
                    score: currentScore + score,
                })

                await checkAchievements(userRef, userData)
            } catch (error) {
                console.error('Ошибка при обновлении данных:', error)
            }
        }
    }

    const handleRestart = () => {
        setSelectedCategory('')
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setScore(0)
        setShowResult(false)
        setAnswers([])
        setShowReview(false)
        setShuffledQuestions([])
    }

    const handleSkipQuestion = () => {
        setAnswers([...answers, {
            question: shuffledQuestions[currentQuestion].question,
            selectedAnswer: null,
            correctAnswer: shuffledQuestions[currentQuestion].correctAnswer,
            isCorrect: false
        }])

        if (currentQuestion < shuffledQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setSelectedAnswer(null)
        } else {
            setShowResult(true)
            handleGameEnd()
        }
    }

    const handleGameEnd = async () => {
        try {
            const userRef = doc(db, 'users', currentUser.uid)
            const userDoc = await getDoc(userRef)
            const userData = userDoc.data()
            const currentScore = userData.score || 0

            await updateDoc(userRef, {
                score: currentScore + score,
            })

            await checkAchievements(userRef, userData)
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Ошибка при выходе:', error)
        }
    }

    if (loading) {
        return <LinearProgress />
    }

    if (!selectedCategory) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 8 }}>
                    <MotionPaper
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        elevation={3}
                        sx={{ p: 4 }}
                    >
                        <Typography variant="h4" component="h1" gutterBottom align="center">
                            Выберите категорию
                        </Typography>

                        <Grid container spacing={3} sx={{ mt: 4 }}>
                            {Object.keys(questions).map((category) => (
                                <Grid item xs={12} sm={6} md={4} key={category}>
                                    <MotionCard
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        sx={{
                                            height: '100%',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                boxShadow: 6,
                                            }
                                        }}
                                        onClick={() => handleCategorySelect(category)}
                                    >
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" gutterBottom>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {questions[category].length} вопросов
                                            </Typography>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            ))}
                        </Grid>
                    </MotionPaper>
                </Box>
            </Container>
        )
    }

    if (showResult) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 8 }}>
                    <MotionPaper
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        elevation={3}
                        sx={{ p: 4 }}
                    >
                        <Typography variant="h4" component="h1" gutterBottom align="center">
                            Игра завершена!
                        </Typography>

                        <Typography variant="h5" gutterBottom align="center" color="primary">
                            Ваш счет: {score}
                        </Typography>

                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setShowReview(true)}
                                >
                                    Обзор ответов
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleRestart}
                                >
                                    Играть снова
                                </Button>
                            </Box>
                            <ShareResult 
                                score={score} 
                                correctAnswers={answers.filter(a => a.isCorrect).length} 
                                totalQuestions={shuffledQuestions.length} 
                            />
                        </Box>
                    </MotionPaper>
                </Box>

                <Dialog
                    open={showReview}
                    onClose={() => setShowReview(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Обзор ответов</DialogTitle>
                    <DialogContent>
                        <List>
                            {answers.map((answer, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1">
                                                    Вопрос {index + 1}:
                                                </Typography>
                                                <Typography variant="body1">
                                                    {answer.question}
                                                </Typography>
                                                <Chip
                                                    icon={answer.isCorrect ? <CheckIcon /> : <CloseIcon />}
                                                    label={answer.isCorrect ? 'Правильно' : 'Неправильно'}
                                                    color={answer.isCorrect ? 'success' : 'error'}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Ваш ответ: {shuffledQuestions[index].options[answer.selectedAnswer]}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Правильный ответ: {shuffledQuestions[index].options[answer.correctAnswer]}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setShowReview(false)}>Закрыть</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        )
    }

    if (selectedCategory && !showResult) {
        return (
            <Container maxWidth="md">
                <AppBar position="static" sx={{ mb: 4 }}>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={handleRestart}
                        >
                            Сменить категорию
                        </Button>
                    </Toolbar>
                </AppBar>

                <Box sx={{ mt: 4 }}>
                    <MotionPaper
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        elevation={3}
                        sx={{ p: 4 }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                Вопрос {currentQuestion + 1} из {shuffledQuestions.length}
                            </Typography>
                            <IconButton 
                                onClick={handleSkipQuestion}
                            >
                                <ArrowForwardIcon />
                            </IconButton>
                        </Box>

                        <Typography variant="h5" gutterBottom>
                            {shuffledQuestions[currentQuestion].question}
                        </Typography>

                        <FormControl component="fieldset" sx={{ mt: 3 }}>
                            <RadioGroup
                                value={selectedAnswer}
                                onChange={(e) => handleAnswerSelect(Number(e.target.value))}
                            >
                                {shuffledQuestions[currentQuestion].options.map((option, index) => (
                                    <FormControlLabel
                                        key={index}
                                        value={index}
                                        control={<Radio />}
                                        label={option}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNextQuestion}
                                disabled={selectedAnswer === null}
                            >
                                Ответить
                            </Button>
                        </Box>
                    </MotionPaper>
                </Box>
            </Container>
        )
    }

    const progress = ((currentQuestion + 1) / shuffledQuestions.length) * 100

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 8 }}>
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    elevation={3}
                    sx={{ p: 4 }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" component="h1">
                            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={handleRestart}
                        >
                            Сменить категорию
                        </Button>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        Вопрос {currentQuestion + 1} из {shuffledQuestions.length}
                    </Typography>

                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mb: 4 }}
                    />

                    <Typography variant="h5" gutterBottom>
                        {shuffledQuestions[currentQuestion].question}
                    </Typography>

                    <FormControl component="fieldset" sx={{ mt: 3 }}>
                        <RadioGroup
                            value={selectedAnswer}
                            onChange={(e) => handleAnswerSelect(Number(e.target.value))}
                        >
                            {shuffledQuestions[currentQuestion].options.map((option, index) => (
                                <FormControlLabel
                                    key={index}
                                    value={index}
                                    control={<Radio />}
                                    label={option}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextQuestion}
                            disabled={selectedAnswer === null}
                        >
                            Ответить
                        </Button>
                    </Box>
                </MotionPaper>
            </Box>

            <Snackbar
                open={!!newAchievement}
                autoHideDuration={6000}
                onClose={() => setNewAchievement(null)}
            >
                <Alert
                    onClose={() => setNewAchievement(null)}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Получено достижение: {newAchievement?.icon} {newAchievement?.title}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default Game 