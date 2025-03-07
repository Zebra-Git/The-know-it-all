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
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { questions } from '../data/questions'
import { achievements } from '../data/achievements'
import { useAuth } from '../contexts/AuthContext'
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../config/firebase'
import ShareResult from '../components/ShareResult'

const MotionPaper = motion(Paper)
const MotionCard = motion(Card)

function Game() {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [score, setScore] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [showResult, setShowResult] = useState(false)
    const [loading, setLoading] = useState(true)
    const [startTime, setStartTime] = useState(null)
    const [newAchievement, setNewAchievement] = useState(null)
    const [correctAnswers, setCorrectAnswers] = useState(0)

    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }
        setLoading(false)
        setStartTime(Date.now())
    }, [currentUser, navigate])

    const handleAnswerSelect = (optionIndex) => {
        setSelectedAnswer(optionIndex)
    }

    const checkAchievements = async (userRef, userData) => {
        const newAchievements = []
        const currentAchievements = userData.achievements || []

        // Проверяем достижения
        achievements.forEach((achievement) => {
            if (!currentAchievements.includes(achievement.id)) {
                if (achievement.id === 'first_win' && score >= achievement.requirement) {
                    newAchievements.push(achievement.id)
                } else if (achievement.id === 'perfect_game' && correctAnswers === questions.length) {
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
        if (selectedAnswer === questions[currentQuestion].correctAnswer) {
            setScore(score + questions[currentQuestion].points)
            setCorrectAnswers(correctAnswers + 1)
        }

        if (currentQuestion < questions.length - 1) {
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

    const progress = ((currentQuestion + 1) / questions.length) * 100

    if (loading) {
        return <LinearProgress />
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Вопрос {currentQuestion + 1} из {questions.length}
                </Typography>
            </Box>

            <AnimatePresence mode="wait">
                {!showResult ? (
                    <MotionCard
                        key="question"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>
                                {questions[currentQuestion].category}
                            </Typography>
                            <Typography variant="h5" gutterBottom>
                                {questions[currentQuestion].question}
                            </Typography>

                            <FormControl component="fieldset" sx={{ mt: 3 }}>
                                <RadioGroup
                                    value={selectedAnswer}
                                    onChange={(e) => handleAnswerSelect(Number(e.target.value))}
                                >
                                    {questions[currentQuestion].options.map((option, index) => (
                                        <FormControlLabel
                                            key={index}
                                            value={index}
                                            control={<Radio />}
                                            label={option}
                                            sx={{
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 1,
                                                bgcolor: selectedAnswer === index ? 'action.selected' : 'transparent',
                                            }}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    onClick={handleNextQuestion}
                                    disabled={selectedAnswer === null}
                                >
                                    {currentQuestion === questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
                                </Button>
                            </Box>
                        </CardContent>
                    </MotionCard>
                ) : (
                    <MotionPaper
                        key="result"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        sx={{ p: 4, textAlign: 'center' }}
                    >
                        <Typography variant="h4" gutterBottom>
                            Игра завершена!
                        </Typography>
                        <Typography variant="h5" color="primary" gutterBottom>
                            Ваш счет: {score}
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            Правильных ответов: {correctAnswers} из {questions.length}
                        </Typography>
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/')}
                            >
                                Вернуться на главную
                            </Button>
                            <ShareResult
                                score={score}
                                correctAnswers={correctAnswers}
                                totalQuestions={questions.length}
                            />
                        </Box>
                    </MotionPaper>
                )}
            </AnimatePresence>

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