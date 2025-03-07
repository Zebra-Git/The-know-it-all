import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionPaper = motion(Paper)

function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
            Добро пожаловать в The know-it-all
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Проверьте свои знания и соревнуйтесь с другими игроками!
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/game"
            sx={{ mt: 4 }}
          >
            Начать игру
          </Button>
        </motion.div>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <MotionPaper
            whileHover={{ scale: 1.05 }}
            sx={{ p: 3, height: '100%' }}
            elevation={3}
          >
            <Typography variant="h5" gutterBottom>
              Разнообразные вопросы
            </Typography>
            <Typography>
              Увлекательные вопросы из различных областей знаний
            </Typography>
          </MotionPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <MotionPaper
            whileHover={{ scale: 1.05 }}
            sx={{ p: 3, height: '100%' }}
            elevation={3}
          >
            <Typography variant="h5" gutterBottom>
              Система достижений
            </Typography>
            <Typography>
              Получайте награды за правильные ответы и улучшайте свой рейтинг
            </Typography>
          </MotionPaper>
        </Grid>
        <Grid item xs={12} md={4}>
          <MotionPaper
            whileHover={{ scale: 1.05 }}
            sx={{ p: 3, height: '100%' }}
            elevation={3}
          >
            <Typography variant="h5" gutterBottom>
              Таблица лидеров
            </Typography>
            <Typography>
              Соревнуйтесь с другими игроками и займите первое место
            </Typography>
          </MotionPaper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Home 