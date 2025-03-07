import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Quiz as QuizIcon,
  EmojiEvents as EmojiEventsIcon,
  Leaderboard as LeaderboardIcon
} from '@mui/icons-material';

const MotionCard = motion(Card);

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Разнообразные вопросы',
      description: 'Выберите интересующую вас категорию и проверьте свои знания',
      icon: <QuizIcon sx={{ fontSize: 60 }} />,
      path: '/game',
      color: '#1976d2'
    },
    {
      title: 'Система достижений',
      description: 'Получайте награды за правильные ответы и улучшайте свои результаты',
      icon: <EmojiEventsIcon sx={{ fontSize: 60 }} />,
      path: '/profile',
      color: '#dc004e'
    },
    {
      title: 'Таблица лидеров',
      description: 'Сравните свои результаты с другими игроками и займите первое место',
      icon: <LeaderboardIcon sx={{ fontSize: 60 }} />,
      path: '/leaderboard',
      color: '#2e7d32'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Добро пожаловать в игру "The know-it-all"!
        </Typography>
        <Typography variant="h5" color="text.secondary" align="center" paragraph>
          Проверьте свои знания в различных категориях и соревнуйтесь с другими игроками
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <MotionCard
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                }
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: feature.color, mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 