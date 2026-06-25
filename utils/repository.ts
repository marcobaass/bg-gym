import { SupabaseClient, User } from "@supabase/supabase-js";
import { insertPositionToSupabase, insertCategoryToSupabase, loadSessionHistory, loadSessionHistoryFromSupabase, loadUserLibrary, loadUserLibraryFromSupabase, saveUserLibrary as saveUserLibraryLocal } from "./userLibrary";
import { UserLibrary, SessionsByCategory, Category, Position } from "@/types/board";

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