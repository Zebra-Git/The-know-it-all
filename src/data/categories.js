import {
    Public as GeographyIcon,
    Face as CosmeticsIcon,
    Restaurant as FoodIcon,
    History as HistoryIcon,
    Science as ScienceIcon,
    Palette as ArtIcon,
    SportsSoccer as SportsIcon,
    Computer as TechnologyIcon,
    MenuBook as LiteratureIcon,
    Checkroom as FashionIcon
} from '@mui/icons-material';

export const categories = [
    {
        id: 'geography',
        name: 'География',
        icon: GeographyIcon,
        description: 'Вопросы о странах, городах, реках, горах и других географических объектах',
    },
    {
        id: 'cosmetics',
        name: 'Косметика',
        icon: CosmeticsIcon,
        description: 'Вопросы о косметических брендах, продуктах и уходе за собой',
    },
    {
        id: 'food',
        name: 'Еда',
        icon: FoodIcon,
        description: 'Вопросы о кулинарии, продуктах питания и национальных блюдах',
    },
    {
        id: 'history',
        name: 'История',
        icon: HistoryIcon,
        description: 'Вопросы о важных исторических событиях, личностях и эпохах',
    },
    {
        id: 'science',
        name: 'Наука',
        icon: ScienceIcon,
        description: 'Вопросы о физике, химии, биологии и других научных дисциплинах',
    },
    {
        id: 'art',
        name: 'Искусство',
        icon: ArtIcon,
        description: 'Вопросы о живописи, музыке, кино и других видах искусства',
    },
    {
        id: 'sports',
        name: 'Спорт',
        icon: SportsIcon,
        description: 'Вопросы о различных видах спорта, спортсменах и соревнованиях',
    },
    {
        id: 'technology',
        name: 'Технологии',
        icon: TechnologyIcon,
        description: 'Вопросы о компьютерах, гаджетах, интернете и технологических инновациях',
    },
    {
        id: 'literature',
        name: 'Литература',
        icon: LiteratureIcon,
        description: 'Вопросы о книгах, писателях, литературных произведениях и жанрах',
    },
    {
        id: 'fashion',
        name: 'Мода',
        icon: FashionIcon,
        description: 'Вопросы о дизайнерах, брендах, трендах и истории моды',
    },
] 