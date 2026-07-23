import { SupabaseClient, User } from "@supabase/supabase-js";
import { deleteCategoryFromSupabase, saveCategorySessionToSupabase, saveCategorySession as saveCategorySessionLocal, insertPositionToSupabase, insertCategoryToSupabase, loadSessionHistory, loadSessionHistoryFromSupabase, loadUserLibrary, loadUserLibraryFromSupabase, saveUserLibrary as saveUserLibraryLocal } from "./userLibrary";
import { CategorySession, UserLibrary, SessionsByCategory, Category, Position } from "@/types/board";

export async function getUserLibrary(supabase: SupabaseClient, user: User | null): Promise<UserLibrary> {    

    if (user) {
        return await loadUserLibraryFromSupabase(supabase)
    } else {
        return loadUserLibrary()
    }
}

export async function getSessionHistory(supabase: SupabaseClient, user: User | null): Promise<SessionsByCategory> {    

    if (user) {
        return await loadSessionHistoryFromSupabase(supabase)
    } else {
        return loadSessionHistory()
    }
}

export async function saveUserLibrary(supabase: SupabaseClient, user: User | null, userLibrary: UserLibrary): Promise<void> {

    if(!user) {
        saveUserLibraryLocal(userLibrary)
        return
    }

    //TODO: saveUserLibraryToSupabase
}

export async function insertCategory(supabase: SupabaseClient, user: User | null, category: Category): Promise<void> {
    if (user) {
        await insertCategoryToSupabase(supabase, user.id, category)
    }
    return
}

export async function insertPosition(supabase: SupabaseClient, user: User | null, categoryId: string, position: Position ): Promise<void> {
    if (user) {
        await insertPositionToSupabase(supabase, user.id, categoryId, position)
    }
    return
}

export async function saveCategorySession(supabase: SupabaseClient, user: User | null, session: CategorySession): Promise<void> {
    if (user) {
        return await saveCategorySessionToSupabase(supabase, user.id, session)
    } else {
        saveCategorySessionLocal(session)
    }
}

export async function deleteCategory(supabase: SupabaseClient, user: User | null, categoryId: string): Promise<void> {
    if (user) {
        return await deleteCategoryFromSupabase(supabase, user.id, categoryId)
    } else {
        const userLibrary = loadUserLibrary()
        const newUserLibrary = userLibrary.library.filter(category => category.category.id !== categoryId)
        saveUserLibraryLocal({library: newUserLibrary})

        const sessionHistory = loadSessionHistory()
        
        delete sessionHistory[categoryId]

        localStorage.setItem('SessionHistory', JSON.stringify(sessionHistory))
        
    }
}