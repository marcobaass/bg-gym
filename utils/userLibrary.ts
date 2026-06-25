import { Category, CategorySession, Position, SessionsByCategory, UserLibrary } from "@/types/board";
import { SupabaseClient } from "@supabase/supabase-js";

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

/**
 * 
 * @returns SessionsByCategory
 * {
 *   categoryId: [
 *     {
 *       id: string;
 *       categoryId: string;
 *       finishedAt: number;
 *      scorePerPosition: number;
 *      rawTotalScore: number;
 *      positionsPlayed: number;
 *     }
 *   ]
 * }
 */

export function loadSessionHistory(): SessionsByCategory {
    if (typeof window === "undefined") return {};
    const sessionHistory = localStorage.getItem('SessionHistory');
    if (sessionHistory === null || sessionHistory === "") {
        return { };
    }
    try {
        return JSON.parse(sessionHistory);
    } catch (error) {
        console.error('Error loading session history:', error);
        return {};
    }
}

export function saveCategorySession(newSession: CategorySession): void {
    // loading all sessions from localStorage
    const allSessions = loadSessionHistory();

    // getting the category sessions for the new session
    const categoryId = newSession.categoryId;
    const categorySessions = allSessions[categoryId] ?? [];

    // adding the new session to the category sessions
    const updatedCategorySessions = [...categorySessions, newSession];

    // keeping only the last 10 sessions
    updatedCategorySessions.sort((a: CategorySession, b: CategorySession) => b.finishedAt - a.finishedAt);
    const trimmedCategorySessions = updatedCategorySessions.slice(0, 10);

    // updating the category sessions in the all sessions
    allSessions[categoryId] = trimmedCategorySessions;

    // saving the all sessions to localStorage
    localStorage.setItem('SessionHistory', JSON.stringify(allSessions));

}

export function getCategoryAverageScore(sessions: SessionsByCategory, categoryId: string): number | null {
    const categorySessions = sessions[categoryId] ?? [];

    if (categorySessions.length === 0) return null;
    const sum = categorySessions.reduce((acc: number, session: CategorySession) => acc + session.scorePerPosition, 0);

    return sum / categorySessions.length;
}

export function getAllSessions(categoryId: string): number | null {
    try {
        const allSessions = loadSessionHistory();
        return getCategoryAverageScore(allSessions, categoryId);
    } catch (error) {
        console.error('Error getting category average score per position:', error);
        return null;
    }
}

export async function loadUserLibraryFromSupabase(supabase: SupabaseClient): Promise<UserLibrary> {
    const { data: categories, error: categoriesError } = await supabase.from('categories').select('id, name')

    if (categoriesError || !categories) {
        return { library: [] };
    }

    const { data: positions, error: positionsError } = await supabase.from('positions').select('category_id, data')

    if (positionsError || !positions) {
        return { library: [] };
    }

    const userLibrary: UserLibrary = {
        library: categories.map((category) => {
            const categoryPositions = positions.filter((position) => position.category_id === category.id)
            return {
                category: category,
                positions: categoryPositions.map((position) => position.data)
            }
        })
    }

    return userLibrary;
}

export async function loadSessionHistoryFromSupabase(supabase: SupabaseClient): Promise<SessionsByCategory> {
    const { data: categorySessions, error: categorySessionsError } = await supabase.from('category_sessions').select('category_id, finished_at, positions_played, score_per_position, raw_total_score, id')

    if (categorySessionsError || !categorySessions) {
        return {};
    }

    const sessionsByCategory: SessionsByCategory = {};
    categorySessions.forEach((session) => {
        sessionsByCategory[session.category_id] = [...(sessionsByCategory[session.category_id] ?? []), {
            id: session.id,
            categoryId: session.category_id,
            finishedAt: session.finished_at,
            positionsPlayed: session.positions_played,
            scorePerPosition: session.score_per_position,
            rawTotalScore: session.raw_total_score,
        }];
    });

    return sessionsByCategory;
}

export async function importLocalStorageToSupabase(
    supabase: SupabaseClient,
    userId: string
  ): Promise<void> {
    const userLibrary = loadUserLibrary();
    const sessionHistory = loadSessionHistory();
  
    if (
      userLibrary.library.length === 0 &&
      Object.keys(sessionHistory).length === 0
    ) {
      return;
    }
  
    const cloudLibrary = await loadUserLibraryFromSupabase(supabase);
    const cloudSessions = await loadSessionHistoryFromSupabase(supabase);
  
    // Set with all category ids in cloudLibrary
    const existingCategoryIdsCloud = new Set(
      cloudLibrary.library.map((entry) => entry.category.id)
    );
  
    // Set with all session ids in cloudSessions
    const existingSessionIdsCloud = new Set<string>();
    for (const sessions of Object.values(cloudSessions)) {
      for (const session of sessions) {
        existingSessionIdsCloud.add(session.id);
      }
    }
  
    const knownCategoriesCloud = cloudLibrary.library.map((entry) => entry.category);
  
    // --- Categories + Positions ---
    for (const lib of userLibrary.library) {
      const categoryId = lib.category.id;
  
      if (!existingCategoryIdsCloud.has(categoryId)) {
        let name = lib.category.name;
        let suffix = 2;
  
        while (isCategoryNameTaken(knownCategoriesCloud, name)) {
          name = `${lib.category.name}_${suffix}`;
          suffix++;
        }
  
        const { error: categoryError } = await supabase.from("categories").insert({
          id: categoryId,
          user_id: userId,
          name,
        });
  
        if (categoryError) {
            console.error("Import category failed:", categoryError);
            if ((categoryError as any).code === '23505') {
              // Kategorie gibt es schon → so behandeln, als wäre sie in der Cloud
              existingCategoryIdsCloud.add(categoryId);
              // knownCategoriesCloud auch ergänzen, damit NameTaken später passt
              knownCategoriesCloud.push({ id: categoryId, name });
              continue;
            }
            return;
          }
  
        knownCategoriesCloud.push({ id: categoryId, name });
        existingCategoryIdsCloud.add(categoryId);
        
        if (lib.positions.length === 0) continue;
    
        const positionRows = lib.positions.map((position) => ({
          category_id: categoryId,
          user_id: userId,
          data: position,
        }));
        
        const { error: positionsError } = await supabase
          .from("positions")
          .insert(positionRows);
    
        if (positionsError) {
          console.error("Import positions failed:", positionsError);
          return;
        }
      }
  
  
    }
  
    // --- Sessions ---
    for (const sessions of Object.values(sessionHistory)) {
      for (const session of sessions) {
        if (existingSessionIdsCloud.has(session.id)) continue;

        if (!existingCategoryIdsCloud.has(session.categoryId)) continue
  
        const { error: sessionError } = await supabase
          .from("category_sessions")
          .insert({
            id: session.id,
            category_id: session.categoryId,
            user_id: userId,
            finished_at: session.finishedAt,
            positions_played: session.positionsPlayed,
            score_per_position: session.scorePerPosition,
            raw_total_score: session.rawTotalScore,
          });
  
          if (sessionError) {
            console.error("Import session failed:", sessionError);
            // Duplicate primary key? → Session gibt es schon → weitermachen
            if ((sessionError as any).code === '23505') {
              existingSessionIdsCloud.add(session.id);
              continue;
            }
            // andere Fehler: Import abbrechen
            return;
          }
  
        existingSessionIdsCloud.add(session.id);
      }
    }
  
    // --- localStorage leeren ---
    if (typeof window !== "undefined") {
      localStorage.removeItem("UserLibrary");
      localStorage.removeItem("SessionHistory");
      clearLastCategoryId();
    }
  }