import { Category, Position, UserLibrary } from "@/types/board";

export function isCategoryNameTaken(userCategories: Category[], name: string) {
    const inputName = name.toLowerCase().trim();

    if (inputName.length === 0) {
        return true;
    }

    if (userCategories.some(category => category.name.toLowerCase().trim() === inputName)) {
        return true;
    } else {
        return false;
    }
}

export function loadUserLibrary(): UserLibrary {
    if (typeof window === "undefined") return { library: [] };
    const rawUserLibrary = localStorage.getItem('UserLibrary');

    if (rawUserLibrary === null || rawUserLibrary === "") {
        return {
            library: [],
        };
    }

    try {
        const userLibrary: unknown = JSON.parse(rawUserLibrary);

        if(
            typeof userLibrary !== "object" ||
            userLibrary === null ||
            Array.isArray(userLibrary)
        ) {
            return { library: [] };
        }

        const maybeLibrary = (userLibrary as Record<string, unknown>).library;
        if (!Array.isArray(maybeLibrary)) {
            return { library: [] };
        }

        return { library: maybeLibrary as UserLibrary["library"] };
    } catch (error) {
        console.error('Error loading user library:', error);
        return { library: [] };
    }
}

export function saveUserLibrary(userLibrary: UserLibrary): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("UserLibrary", JSON.stringify(userLibrary));
}

const LAST_CATEGORY_STORAGE_KEY = "lastCategoryId";

export function getLastCategoryId(): string | null {
    if (typeof window === "undefined") return null;
    const lastCategoryId = localStorage.getItem(LAST_CATEGORY_STORAGE_KEY);
    if (lastCategoryId === null || lastCategoryId === "") {
        return null;
    }
    return lastCategoryId;
}

export function setLastCategoryId(categoryId: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(LAST_CATEGORY_STORAGE_KEY, categoryId);
}

export function clearLastCategoryId(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LAST_CATEGORY_STORAGE_KEY);
}

export function shufflePositions(positions: Position[]): Position[] {
    for (let i = positions.length -1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        const temp = positions[i];
        positions[i] = positions[j];
        positions[j] = temp;   
    }
    return positions;
}