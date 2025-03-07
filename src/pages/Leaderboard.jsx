import { useState, useEffect } from 'react'
import {
    Container,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    CircularProgress,
} from '@mui/material'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { motion } from 'framer-motion'

const MotionPaper = motion(Paper)

function Leaderboard() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('score', 'desc'), limit(10))
                const querySnapshot = await getDocs(q)
                const usersData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setUsers(usersData)
            } catch (error) {
                console.error('Ошибка при загрузке таблицы лидеров:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

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

    return (
        <Container maxWidth="md">
            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{ p: 4, mt: 4 }}
            >
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Таблица лидеров
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Место</TableCell>
                                <TableCell>Пользователь</TableCell>
                                <TableCell align="right">Очки</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user, index) => (
                                <TableRow
                                    key={user.id}
                                    sx={{
                                        bgcolor: index === 0 ? 'primary.main' : index === 1 ? 'secondary.main' : index === 2 ? 'warning.main' : 'transparent',
                                        '& td': {
                                            color: index < 3 ? 'white' : 'inherit',
                                        },
                                    }}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell align="right">{user.score}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </MotionPaper>
        </Container>
    )
}

export default Leaderboard 