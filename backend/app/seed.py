"""Database Seed Script for Duolingo Clone.

Payload Shapes:
- multiple_choice:
    {"prompt": str, "options": [str x4], "correct_index": int}
- translate_word_bank:
    {"prompt": "Translate this sentence", "sentence_to_translate": str, "word_bank": [str], "correct_answer": [str]}
- match_pairs:
    {"pairs": [{"left": str, "right": str} x5]}
- fill_blank:
    {"sentence_with_blank": str containing "____", "options": [str x3], "correct_option": str}
- type_answer:
    {"prompt": str, "accepted_answers": [str]}
"""

import random
import re
from datetime import timedelta
from typing import Any
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.clock import get_today, utcnow
from app.database import Base, engine, SessionLocal
from app.models import (
    Achievement,
    Course,
    DailyActivity,
    Exercise,
    ExerciseType,
    Lesson,
    Skill,
    Unit,
    User,
    UserAchievement,
    UserSkillProgress,
    XpEvent,
)

SEED_RANDOM_VALUE = 42


def clean_word(word: str) -> str:
    """Lowercase and strip all punctuation."""
    return re.sub(r"[¿?¡!.,;:\"'()\-]", "", word).strip().lower()


def process_exercise_payload(
    ex_type: ExerciseType,
    raw_payload: dict[str, Any],
    rng: random.Random,
    mc_counter: int = 0,
) -> dict[str, Any]:
    """Applies required seed transformations (shuffling options, cleaning word banks)."""
    if ex_type == ExerciseType.MULTIPLE_CHOICE:
        options = list(raw_payload["options"])
        correct_answer = options[raw_payload["correct_index"]]
        distractors = [opt for opt in options if opt != correct_answer]
        rng.shuffle(distractors)
        target_idx = mc_counter % 4
        shuffled_options: list[str] = []
        d_idx = 0
        for i in range(4):
            if i == target_idx:
                shuffled_options.append(correct_answer)
            else:
                shuffled_options.append(distractors[d_idx])
                d_idx += 1
        return {
            "prompt": raw_payload["prompt"],
            "options": shuffled_options,
            "correct_index": target_idx,
        }
    elif ex_type == ExerciseType.TRANSLATE_WORD_BANK:
        clean_correct = [clean_word(w) for w in raw_payload["correct_answer"] if clean_word(w)]
        clean_bank = [clean_word(w) for w in raw_payload["word_bank"] if clean_word(w)]
        rng.shuffle(clean_bank)
        # Ensure the shuffled bank is not in exact correct answer order
        if len(clean_bank) >= len(clean_correct) and clean_bank[:len(clean_correct)] == clean_correct:
            clean_bank[0], clean_bank[-1] = clean_bank[-1], clean_bank[0]
        return {
            "prompt": "Translate this sentence",
            "sentence_to_translate": raw_payload["sentence_to_translate"],
            "word_bank": clean_bank,
            "correct_answer": clean_correct,
        }
    return raw_payload


def get_curated_raw_exercises(skill_title: str, level: int) -> list[dict[str, Any]]:
    """Returns raw exercise templates for a given skill and level."""
    if skill_title == "Basics":
        if level == 1:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which of these is "the boy"?',
                        "options": ["El niño", "La niña", "La mujer", "El hombre"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The girl drinks water",
                        "word_bank": ["La", "niña", "bebe", "agua", "el", "come"],
                        "correct_answer": ["La", "niña", "bebe", "agua"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "boy", "right": "niño"},
                            {"left": "girl", "right": "niña"},
                            {"left": "water", "right": "agua"},
                            {"left": "bread", "right": "pan"},
                            {"left": "milk", "right": "leche"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "El niño ____ pan.",
                        "options": ["come", "bebe", "es"],
                        "correct_option": "come",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'the woman' in Spanish",
                        "accepted_answers": ["la mujer", "La mujer"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which of these is "the apple"?',
                        "options": ["La manzana", "El pan", "El agua", "La leche"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "I am a woman",
                        "word_bank": ["Yo", "soy", "una", "mujer", "un", "niño"],
                        "correct_answer": ["Yo", "soy", "una", "mujer"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Yo ____ un hombre.",
                        "options": ["soy", "eres", "es"],
                        "correct_option": "soy",
                    },
                },
            ]
        else:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What does "Ella come una manzana" mean?',
                        "options": ["She eats an apple", "He drinks water", "She drinks milk", "I eat bread"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "He drinks water and eats bread",
                        "word_bank": ["Él", "bebe", "agua", "y", "come", "pan", "ella", "leche"],
                        "correct_answer": ["Él", "bebe", "agua", "y", "come", "pan"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "he", "right": "él"},
                            {"left": "she", "right": "ella"},
                            {"left": "I", "right": "yo"},
                            {"left": "and", "right": "y"},
                            {"left": "a (masculine)", "right": "un"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Ella ____ una manzana.",
                        "options": ["come", "bebe", "soy"],
                        "correct_option": "come",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Translate: 'The girl eats bread'",
                        "accepted_answers": ["La niña come pan", "la niña come pan", "La nina come pan", "la nina come pan"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Choose the correct sentence for "The man drinks milk":',
                        "options": ["El hombre bebe leche", "La mujer come pan", "El niño bebe agua", "Él es un hombre"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "She is a girl",
                        "word_bank": ["Ella", "es", "una", "niña", "él", "niño"],
                        "correct_answer": ["Ella", "es", "una", "niña"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Tú ____ pan.",
                        "options": ["comes", "come", "como"],
                        "correct_option": "comes",
                    },
                },
            ]

    elif skill_title == "Greetings":
        if level == 1:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'How do you say "Hello" in Spanish?',
                        "options": ["Hola", "Adiós", "Gracias", "Por favor"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "Good morning, how are you?",
                        "word_bank": ["Buenos", "días", "cómo", "estás", "noches", "gracias"],
                        "correct_answer": ["Buenos", "días", "cómo", "estás"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "hello", "right": "hola"},
                            {"left": "goodbye", "right": "adiós"},
                            {"left": "please", "right": "por favor"},
                            {"left": "thanks", "right": "gracias"},
                            {"left": "morning", "right": "mañana"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "¡Buenos ____!",
                        "options": ["días", "tardes", "noches"],
                        "correct_option": "días",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'Thank you' in Spanish",
                        "accepted_answers": ["gracias", "Gracias"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What is the opposite of "Hola"?',
                        "options": ["Adiós", "Por favor", "Mucho gusto", "Buenas tardes"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "Good night and goodbye",
                        "word_bank": ["Buenas", "noches", "y", "adiós", "días", "hola"],
                        "correct_answer": ["Buenas", "noches", "y", "adiós"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Muchas ____.",
                        "options": ["gracias", "favor", "gusto"],
                        "correct_option": "gracias",
                    },
                },
            ]
        else:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What does "Mucho gusto" mean?',
                        "options": ["Nice to meet you", "See you tomorrow", "Good afternoon", "You are welcome"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "Hello, nice to meet you",
                        "word_bank": ["Hola", "mucho", "gusto", "en", "conocerte", "adiós", "tardes"],
                        "correct_answer": ["Hola", "mucho", "gusto", "en", "conocerte"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "nice to meet you", "right": "mucho gusto"},
                            {"left": "see you later", "right": "hasta luego"},
                            {"left": "see you tomorrow", "right": "hasta mañana"},
                            {"left": "you're welcome", "right": "de nada"},
                            {"left": "sorry", "right": "lo siento"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Hasta ____, amigo.",
                        "options": ["luego", "gracias", "nada"],
                        "correct_option": "luego",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Translate 'See you tomorrow' into Spanish",
                        "accepted_answers": ["Hasta mañana", "hasta mañana", "Hasta manana", "hasta manana"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'How do you reply to "Gracias"?',
                        "options": ["De nada", "Por favor", "Hola", "Buenos días"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "Excuse me, where is the hotel?",
                        "word_bank": ["Disculpe", "dónde", "está", "el", "hotel", "gracias", "favor"],
                        "correct_answer": ["Disculpe", "dónde", "está", "el", "hotel"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Lo ____ mucho.",
                        "options": ["siento", "nada", "gusto"],
                        "correct_option": "siento",
                    },
                },
            ]

    elif skill_title == "Food":
        if level == 1:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which of these means "cheese"?',
                        "options": ["El queso", "El arroz", "La carne", "La sopa"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "I eat rice and chicken",
                        "word_bank": ["Yo", "como", "arroz", "y", "pollo", "pescado", "bebo"],
                        "correct_answer": ["Yo", "como", "arroz", "y", "pollo"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "cheese", "right": "queso"},
                            {"left": "rice", "right": "arroz"},
                            {"left": "chicken", "right": "pollo"},
                            {"left": "meat", "right": "carne"},
                            {"left": "soup", "right": "sopa"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Me gusta el ____.",
                        "options": ["queso", "bebe", "come"],
                        "correct_option": "queso",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'the water' in Spanish",
                        "accepted_answers": ["el agua", "El agua"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which of these is a drink?',
                        "options": ["El jugo", "La carne", "El arroz", "El huevo"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The girl drinks orange juice",
                        "word_bank": ["La", "niña", "bebe", "jugo", "de", "naranja", "come", "pan"],
                        "correct_answer": ["La", "niña", "bebe", "jugo", "de", "naranja"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "El desayuno tiene ____.",
                        "options": ["huevos", "agua", "bebe"],
                        "correct_option": "huevos",
                    },
                },
            ]
        else:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Translate: "We eat dinner at eight"',
                        "options": ["Cenamos a las ocho", "Comemos carne fría", "Bebemos vino tinto", "Desayunamos café"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "I want a cup of coffee with sugar",
                        "word_bank": ["Quiero", "una", "taza", "de", "café", "con", "azúcar", "sin", "leche"],
                        "correct_answer": ["Quiero", "una", "taza", "de", "café", "con", "azúcar"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "coffee", "right": "café"},
                            {"left": "tea", "right": "té"},
                            {"left": "sugar", "right": "azúcar"},
                            {"left": "salad", "right": "ensalada"},
                            {"left": "fish", "right": "pescado"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "La cuenta, por ____.",
                        "options": ["favor", "gracias", "nada"],
                        "correct_option": "favor",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'The soup is hot' in Spanish",
                        "accepted_answers": ["La sopa está caliente", "la sopa esta caliente", "La sopa esta caliente", "la sopa está caliente"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which word means "delicious"?',
                        "options": ["Delicioso", "Salado", "Amargo", "Picante"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "A table for two people, please",
                        "word_bank": ["Una", "mesa", "para", "dos", "personas", "por", "favor", "tres", "cuenta"],
                        "correct_answer": ["Una", "mesa", "para", "dos", "personas", "por", "favor"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "El café está con ____.",
                        "options": ["leche", "come", "plato"],
                        "correct_option": "leche",
                    },
                },
            ]

    elif skill_title == "Animals":
        if level == 1:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which of these is "the dog"?',
                        "options": ["El perro", "El gato", "El pájaro", "El caballo"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The cat drinks milk",
                        "word_bank": ["El", "gato", "bebe", "leche", "perro", "come"],
                        "correct_answer": ["El", "gato", "bebe", "leche"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "dog", "right": "perro"},
                            {"left": "cat", "right": "gato"},
                            {"left": "bird", "right": "pájaro"},
                            {"left": "horse", "right": "caballo"},
                            {"left": "fish", "right": "pez"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "El ____ ladra fuerte.",
                        "options": ["perro", "gato", "pájaro"],
                        "correct_option": "perro",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'the horse' in Spanish",
                        "accepted_answers": ["el caballo", "El caballo"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which animal can fly?',
                        "options": ["El pájaro", "El oso", "El pez", "La tortuga"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The bear eats fish",
                        "word_bank": ["El", "oso", "come", "pescado", "perro", "leche"],
                        "correct_answer": ["El", "oso", "come", "pescado"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Mi ____ es un gato blanco.",
                        "options": ["mascota", "come", "vuela"],
                        "correct_option": "mascota",
                    },
                },
            ]
        else:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What does "El león corre en la sabana" mean?',
                        "options": ["The lion runs in the savannah", "The tiger sleeps", "The bird sings loudly", "The dog plays outside"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The rabbit jumps in the green garden",
                        "word_bank": ["El", "conejo", "salta", "en", "el", "jardín", "verde", "oso", "corre"],
                        "correct_answer": ["El", "conejo", "salta", "en", "el", "jardín", "verde"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "lion", "right": "león"},
                            {"left": "elephant", "right": "elefante"},
                            {"left": "rabbit", "right": "conejo"},
                            {"left": "monkey", "right": "mono"},
                            {"left": "turtle", "right": "tortuga"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "La tortuga camina muy ____.",
                        "options": ["despacio", "rápido", "verde"],
                        "correct_option": "despacio",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Translate: 'The bird sings in the morning'",
                        "accepted_answers": ["El pájaro canta en la mañana", "el pajaro canta en la manana", "El pajaro canta en la manana", "el pájaro canta en la mañana"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Choose the correct word for "butterfly":',
                        "options": ["Mariposa", "Abeja", "Araña", "Mosca"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The big elephant has large ears",
                        "word_bank": ["El", "elefante", "grande", "tiene", "orejas", "grandes", "pequeño", "gato"],
                        "correct_answer": ["El", "elefante", "grande", "tiene", "orejas", "grandes"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "El mono come una ____.",
                        "options": ["banana", "carne", "leche"],
                        "correct_option": "banana",
                    },
                },
            ]

    elif skill_title == "Family":
        if level == 1:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which of these is "the mother"?',
                        "options": ["La madre", "El padre", "El hermano", "La abuela"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "My brother has a dog",
                        "word_bank": ["Mi", "hermano", "tiene", "un", "perro", "madre", "gato"],
                        "correct_answer": ["Mi", "hermano", "tiene", "un", "perro"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "father", "right": "padre"},
                            {"left": "mother", "right": "madre"},
                            {"left": "brother", "right": "hermano"},
                            {"left": "sister", "right": "hermana"},
                            {"left": "son", "right": "hijo"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Mi ____ es muy cariñosa.",
                        "options": ["madre", "perro", "pan"],
                        "correct_option": "madre",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'the sister' in Spanish",
                        "accepted_answers": ["la hermana", "La hermana"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Who is "el abuelo"?',
                        "options": ["The grandfather", "The father", "The uncle", "The cousin"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "My family lives in Madrid",
                        "word_bank": ["Mi", "familia", "vive", "en", "Madrid", "hermano", "come"],
                        "correct_answer": ["Mi", "familia", "vive", "en", "Madrid"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Ella es mi ____ favorita.",
                        "options": ["hermana", "padre", "abuelo"],
                        "correct_option": "hermana",
                    },
                },
            ]
        else:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What does "Mis abuelos viajan a España" mean?',
                        "options": ["My grandparents travel to Spain", "My parents buy a house", "My cousins visit Mexico", "My siblings speak Spanish"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "My uncle and my aunt have two children",
                        "word_bank": ["Mi", "tío", "y", "mi", "tía", "tienen", "dos", "hijos", "abuela", "tres"],
                        "correct_answer": ["Mi", "tío", "y", "mi", "tía", "tienen", "dos", "hijos"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "grandfather", "right": "abuelo"},
                            {"left": "grandmother", "right": "abuela"},
                            {"left": "uncle", "right": "tío"},
                            {"left": "aunt", "right": "tía"},
                            {"left": "cousin", "right": "primo"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Nuestros ____ viven en Barcelona.",
                        "options": ["primos", "hija", "madre"],
                        "correct_option": "primos",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Translate: 'My father cooks well'",
                        "accepted_answers": ["Mi padre cocina bien", "mi padre cocina bien"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which word means "daughter"?',
                        "options": ["Hija", "Hijo", "Sobrina", "Nieta"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "We love our grandparents very much",
                        "word_bank": ["Queremos", "mucho", "a", "nuestros", "abuelos", "padres", "casa"],
                        "correct_answer": ["Queremos", "mucho", "a", "nuestros", "abuelos"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Mi sobrino es el hijo de mi ____.",
                        "options": ["hermano", "abuela", "esposo"],
                        "correct_option": "hermano",
                    },
                },
            ]

    else:  # Colors
        if level == 1:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which color is "rojo"?',
                        "options": ["Red", "Blue", "Green", "Yellow"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The blue shirt is clean",
                        "word_bank": ["La", "camisa", "azul", "está", "limpia", "roja", "verde"],
                        "correct_answer": ["La", "camisa", "azul", "está", "limpia"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "red", "right": "rojo"},
                            {"left": "blue", "right": "azul"},
                            {"left": "green", "right": "verde"},
                            {"left": "yellow", "right": "amarillo"},
                            {"left": "black", "right": "negro"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "El cielo es ____.",
                        "options": ["azul", "rojo", "negro"],
                        "correct_option": "azul",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Type 'green' in Spanish",
                        "accepted_answers": ["verde", "Verde"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What color is a banana?',
                        "options": ["Amarillo", "Azul", "Morado", "Rosa"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "I have a black cat and a white dog",
                        "word_bank": ["Tengo", "un", "gato", "negro", "y", "un", "perro", "blanco", "rojo", "azul"],
                        "correct_answer": ["Tengo", "un", "gato", "negro", "y", "un", "perro", "blanco"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "La manzana es ____ y dulce.",
                        "options": ["roja", "azul", "negra"],
                        "correct_option": "roja",
                    },
                },
            ]
        else:
            return [
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'What does "El coche gris es nuevo y rápido" mean?',
                        "options": ["The gray car is new and fast", "The red bus is slow", "The blue bike is broken", "The green train is late"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The purple flowers in the garden are pretty",
                        "word_bank": ["Las", "flores", "moradas", "del", "jardín", "son", "bonitas", "rosas", "árbol"],
                        "correct_answer": ["Las", "flores", "moradas", "del", "jardín", "son", "bonitas"],
                    },
                },
                {
                    "type": ExerciseType.MATCH_PAIRS,
                    "payload": {
                        "pairs": [
                            {"left": "white", "right": "blanco"},
                            {"left": "gray", "right": "gris"},
                            {"left": "purple", "right": "morado"},
                            {"left": "orange (color)", "right": "naranja"},
                            {"left": "brown", "right": "marrón"},
                        ]
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Ella lleva un vestido ____ brillante.",
                        "options": ["dorado", "azul", "comer"],
                        "correct_option": "dorado",
                    },
                },
                {
                    "type": ExerciseType.TYPE_ANSWER,
                    "payload": {
                        "prompt": "Translate: 'The shoes are brown'",
                        "accepted_answers": ["Los zapatos son marrones", "los zapatos son marrones", "Los zapatos son cafés", "los zapatos son cafes"],
                    },
                },
                {
                    "type": ExerciseType.MULTIPLE_CHOICE,
                    "payload": {
                        "prompt": 'Which color is made by mixing red and white?',
                        "options": ["Rosa", "Gris", "Morado", "Naranja"],
                        "correct_index": 0,
                    },
                },
                {
                    "type": ExerciseType.TRANSLATE_WORD_BANK,
                    "payload": {
                        "prompt": "Translate this sentence",
                        "sentence_to_translate": "The sun is yellow and the grass is green",
                        "word_bank": ["El", "sol", "es", "amarillo", "y", "el", "pasto", "es", "verde", "rojo", "cielo"],
                        "correct_answer": ["El", "sol", "es", "amarillo", "y", "el", "pasto", "es", "verde"],
                    },
                },
                {
                    "type": ExerciseType.FILL_BLANK,
                    "payload": {
                        "sentence_with_blank": "Mis pantalones favoritos son de color ____.",
                        "options": ["oscuro", "hablar", "saltar"],
                        "correct_option": "oscuro",
                    },
                },
            ]


def print_table_counts(session: Session) -> dict[str, int]:
    """Queries and displays the total row count for every database table."""
    models = [
        Course,
        Unit,
        Skill,
        Lesson,
        Exercise,
        User,
        UserSkillProgress,
        XpEvent,
        DailyActivity,
        Achievement,
        UserAchievement,
    ]
    counts = {}
    print("\n" + "=" * 40)
    print(f"{'Table Name':<25} {'Row Count':<10}")
    print("-" * 40)
    for model in models:
        table_name = model.__tablename__
        count = session.scalar(select(func.count()).select_from(model)) or 0
        counts[table_name] = count
        print(f"{table_name:<25} {count:<10}")
    print("=" * 40 + "\n")
    return counts


def is_db_empty(session: Session) -> bool:
    """Checks if the database is empty by counting Course records."""
    count = session.scalar(select(func.count()).select_from(Course)) or 0
    return count == 0


def seed_database(
    target_engine=None, target_session_factory=None, reset: bool = False
) -> dict[str, int]:
    """Seeds the database.
    
    If reset=True, wipes tables and reseeds.
    If reset=False, seeds only if the database is empty.
    """
    eng = target_engine or engine
    session_cls = target_session_factory or sessionmaker(
        autocommit=False, autoflush=False, bind=eng
    )

    # 1. Ensure tables exist
    Base.metadata.create_all(bind=eng)

    check_session = session_cls()
    empty = is_db_empty(check_session)
    check_session.close()

    if not reset and not empty:
        print("Database already contains data. Skipping seeding. Use --reset to wipe and reseed.")
        session = session_cls()
        try:
            return print_table_counts(session)
        finally:
            session.close()

    if reset:
        Base.metadata.drop_all(bind=eng)
        Base.metadata.create_all(bind=eng)

    session = session_cls()
    rng = random.Random(SEED_RANDOM_VALUE)
    now = utcnow()
    yesterday = get_today() - timedelta(days=1)
    mc_counter = 0

    try:
        # 2. Create Spanish Course
        course = Course(title="Spanish", code="es", language="Spanish")
        session.add(course)
        session.flush()

        # 3. Create Units & Skills hierarchy
        units_data = [
            {
                "title": "Unit 1: Getting started",
                "position": 1,
                "skills": ["Basics", "Greetings", "Food"],
            },
            {
                "title": "Unit 2: Everyday life",
                "position": 2,
                "skills": ["Animals", "Family", "Colors"],
            },
        ]

        skills_by_title: dict[str, Skill] = {}
        lessons_by_skill_and_level: dict[tuple[str, int], Lesson] = {}

        for u_idx, u_data in enumerate(units_data, start=1):
            unit = Unit(course_id=course.id, title=u_data["title"], position=u_data["position"])
            session.add(unit)
            session.flush()

            for s_idx, skill_name in enumerate(u_data["skills"], start=1):
                skill = Skill(
                    unit_id=unit.id,
                    title=skill_name,
                    position=s_idx,
                    max_level=2,
                )
                session.add(skill)
                session.flush()
                skills_by_title[skill_name] = skill

                # Exactly 2 lessons per skill (level 1 and level 2)
                for level in (1, 2):
                    lesson = Lesson(
                        skill_id=skill.id,
                        position=level,
                        level=level,
                    )
                    session.add(lesson)
                    session.flush()
                    lessons_by_skill_and_level[(skill_name, level)] = lesson

                    # 8 exercises per lesson
                    raw_exercises = get_curated_raw_exercises(skill_name, level)
                    for pos, raw_ex in enumerate(raw_exercises, start=1):
                        if raw_ex["type"] == ExerciseType.MULTIPLE_CHOICE:
                            payload = process_exercise_payload(
                                raw_ex["type"], raw_ex["payload"], rng, mc_counter=mc_counter
                            )
                            mc_counter += 1
                        else:
                            payload = process_exercise_payload(
                                raw_ex["type"], raw_ex["payload"], rng
                            )

                        exercise = Exercise(
                            lesson_id=lesson.id,
                            type=raw_ex["type"],
                            payload=payload,
                            position=pos,
                        )
                        session.add(exercise)

        session.flush()

        # 4. Create Default User "learner"
        default_user = User(
            username="learner",
            total_xp=120,
            streak=3,
            last_active_date=yesterday,
            hearts=5,
            hearts_updated_at=now,
            daily_goal_xp=20,
            gems=500,
            created_at=now - timedelta(days=5),
        )
        session.add(default_user)
        session.flush()

        # User progress: Basics completed (level 2), Greetings (level 1)
        basics_skill = skills_by_title["Basics"]
        greetings_skill = skills_by_title["Greetings"]

        session.add_all(
            [
                UserSkillProgress(user_id=default_user.id, skill_id=basics_skill.id, level_completed=2),
                UserSkillProgress(user_id=default_user.id, skill_id=greetings_skill.id, level_completed=1),
            ]
        )

        # XP events & Daily activity for default user
        lesson_basics_1 = lessons_by_skill_and_level[("Basics", 1)]
        lesson_basics_2 = lessons_by_skill_and_level[("Basics", 2)]
        lesson_greetings_1 = lessons_by_skill_and_level[("Greetings", 1)]

        session.add_all(
            [
                XpEvent(user_id=default_user.id, lesson_id=lesson_basics_1.id, xp_amount=40, created_at=now - timedelta(days=2)),
                XpEvent(user_id=default_user.id, lesson_id=lesson_basics_2.id, xp_amount=40, created_at=now - timedelta(days=1)),
                XpEvent(user_id=default_user.id, lesson_id=lesson_greetings_1.id, xp_amount=40, created_at=now - timedelta(days=1)),
            ]
        )

        session.add(
            DailyActivity(
                user_id=default_user.id,
                activity_date=yesterday,
                lessons_completed=2,
                xp_earned=80,
            )
        )

        # 5. Create 10 other realistic users for Leaderboard
        leaderboard_users = [
            ("carlos_dev", 880, 12, 750),
            ("maria_es", 750, 9, 620),
            ("sofia_travel", 620, 7, 540),
            ("lucas_poly", 510, 5, 480),
            ("elena_w", 430, 4, 390),
            ("mateo_99", 310, 3, 300),
            ("valentina_k", 240, 2, 250),
            ("diego_r", 160, 2, 200),
            ("camila_b", 90, 1, 150),
            ("alejandro_g", 40, 1, 100),
        ]

        for uname, xp, streak, gems in leaderboard_users:
            u = User(
                username=uname,
                total_xp=xp,
                streak=streak,
                last_active_date=yesterday,
                hearts=5,
                hearts_updated_at=now,
                daily_goal_xp=20,
                gems=gems,
                created_at=now - timedelta(days=10),
            )
            session.add(u)

        session.flush()

        # 6. Create 8 Achievements
        achievements_data = [
            ("first_lesson", "First Steps", "Complete your first lesson", 1),
            ("streak_3", "On Fire", "Reach a 3-day streak", 3),
            ("streak_7", "Wildfire", "Reach a 7-day streak", 7),
            ("xp_100", "Century Club", "Earn 100 total XP", 100),
            ("xp_500", "XP Master", "Earn 500 total XP", 500),
            ("perfect_lesson", "Flawless", "Complete a lesson without mistakes", 1),
            ("skills_3", "Scholar", "Complete 3 skills", 3),
            ("daily_goal", "Goal Crusher", "Reach your daily XP goal", 20),
        ]

        achievements_by_key: dict[str, Achievement] = {}
        for key, title, desc, threshold in achievements_data:
            ach = Achievement(key=key, title=title, description=desc, threshold=threshold)
            session.add(ach)
            session.flush()
            achievements_by_key[key] = ach

        # Unlock first_lesson and streak_3 for learner
        session.add_all(
            [
                UserAchievement(
                    user_id=default_user.id,
                    achievement_id=achievements_by_key["first_lesson"].id,
                    unlocked_at=now - timedelta(days=2),
                ),
                UserAchievement(
                    user_id=default_user.id,
                    achievement_id=achievements_by_key["streak_3"].id,
                    unlocked_at=now - timedelta(days=1),
                ),
            ]
        )

        session.commit()
        counts = print_table_counts(session)
        return counts
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed Duolingo clone database.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Wipe and reseed all database tables.",
    )
    args = parser.parse_args()

    print(f"Running seed (reset={args.reset})...")
    seed_database(reset=args.reset)
    print("Database seeding completed successfully.")