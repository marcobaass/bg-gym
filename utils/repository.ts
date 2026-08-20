import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  deleteCategoryFromSupabase,
  saveCategorySessionToSupabase,
  saveCategorySession as saveCategorySessionLocal,
  insertPositionToSupabase,
  insertCategoryToSupabase,
  loadSessionHistory,
  loadSessionHistoryFromSupabase,
  loadUserLibrary,
  loadUserLibraryFromSupabase,
  saveUserLibrary as saveUserLibraryLocal,
  movePositionInLocalLibrary,
  deletePositionFromLocalLibrary,
  movePositionToSupabase,
  deletePositionFromSupabase,
} from "./userLibrary";
import {
  CategorySession,
  UserLibrary,
  SessionsByCategory,
  Category,
  Position,
} from "@/types/board";

export async function getUserLibrary(
  supabase: SupabaseClient,
  user: User | null,
): Promise<UserLibrary> {
  if (user) {
    return await loadUserLibraryFromSupabase(supabase);
  } else {
    const localLibrary = loadUserLibrary();
    const remoteLibrary = await loadUserLibraryFromSupabase(supabase);
    return {
      library: [...localLibrary.library, ...remoteLibrary.library],
    };
  }
}

export async function getSessionHistory(
  supabase: SupabaseClient,
  user: User | null,
): Promise<SessionsByCategory> {
  if (user) {
    return await loadSessionHistoryFromSupabase(supabase);
  } else {
    return loadSessionHistory();
  }
}

export async function saveUserLibrary(
  supabase: SupabaseClient,
  user: User | null,
  userLibrary: UserLibrary,
): Promise<void> {
  if (!user) {
    saveUserLibraryLocal(userLibrary);
    return;
  }

  //TODO: saveUserLibraryToSupabase
}

export async function movePosition(
  supabase: SupabaseClient,
  user: User | null,
  sourceCategoryId: string,
  targetCategoryId: string,
  positionId: string,
): Promise<boolean> {
  if (!positionId) return false;

  let userLibrary;
  if (!user) {
    userLibrary = loadUserLibrary();
  } else {
    userLibrary = await getUserLibrary(supabase, user);
  }

  const categoryEntry = userLibrary.library.find(
    (category) => category.category.id === sourceCategoryId,
  );
  if (!categoryEntry) {
    return false;
  }

  const targetCategoryEntry = userLibrary.library.find(
    (category) => category.category.id === targetCategoryId,
  );
  if (!targetCategoryEntry) {
    return false;
  }

  const visibilitySource = categoryEntry.category.visibility;
  const visibilityTarget = targetCategoryEntry.category.visibility;
  if (
    !canUserEditCategory(user, visibilitySource) ||
    !canUserEditCategory(user, visibilityTarget)
  ) {
    return false;
  }

  if (user) {
    return await movePositionToSupabase(supabase, positionId, targetCategoryId);
  } else {
    movePositionInLocalLibrary(
      userLibrary,
      sourceCategoryId,
      targetCategoryId,
      positionId,
    );
    saveUserLibraryLocal(userLibrary);
    return true;
  }
}

export async function deletePosition(
  supabase: SupabaseClient,
  user: User | null,
  categoryId: string,
  positionId: string,
): Promise<boolean> {
  if (!positionId) return false;

  let userLibrary;
  if (!user) {
    userLibrary = loadUserLibrary();
  } else {
    userLibrary = await getUserLibrary(supabase, user);
  }

  const categoryEntry = userLibrary.library.find(
    (category) => category.category.id === categoryId,
  );
  if (!categoryEntry) {
    return false;
  }

  const visibility = categoryEntry.category.visibility;
  if (!canUserEditCategory(user, visibility)) {
    return false;
  }

  if (user) {
    return await deletePositionFromSupabase(supabase, positionId);
  } else {
    const userLibrary = loadUserLibrary();
    deletePositionFromLocalLibrary(userLibrary, categoryId, positionId);
    saveUserLibraryLocal(userLibrary);
    return true;
  }
}

export async function insertCategory(
  supabase: SupabaseClient,
  user: User | null,
  category: Category,
): Promise<void> {
  if (user) {
    await insertCategoryToSupabase(supabase, user.id, category);
  }
  return;
}

export async function insertPosition(
  supabase: SupabaseClient,
  user: User | null,
  categoryId: string,
  position: Position,
): Promise<void> {
  if (user) {
    await insertPositionToSupabase(supabase, user.id, categoryId, position);
  }
  return;
}

export async function saveCategorySession(
  supabase: SupabaseClient,
  user: User | null,
  session: CategorySession,
): Promise<void> {
  if (user) {
    return await saveCategorySessionToSupabase(supabase, user.id, session);
  } else {
    saveCategorySessionLocal(session);
  }
}

export async function deleteCategory(
  supabase: SupabaseClient,
  user: User | null,
  categoryId: string,
): Promise<void> {
  let userLibrary;
  if (!user) {
    userLibrary = loadUserLibrary();
  } else {
    userLibrary = await getUserLibrary(supabase, user);
  }

  const category = userLibrary.library.find(
    (category) => category.category.id === categoryId,
  );
  if (!category) {
    return;
  }
  const visibility = category.category.visibility;

  if (!canUserEditCategory(user, visibility)) {
    return;
  }
  if (user) {
    return await deleteCategoryFromSupabase(supabase, user.id, categoryId);
  } else {
    const newUserLibrary = userLibrary.library.filter(
      (category) => category.category.id !== categoryId,
    );
    saveUserLibraryLocal({ library: newUserLibrary });

    const sessionHistory = loadSessionHistory();

    delete sessionHistory[categoryId];

    localStorage.setItem("SessionHistory", JSON.stringify(sessionHistory));
  }
}

//--------------------Helpers--------------------
export function canUserEditCategory(
  user: User | null,
  visibility: string | undefined,
): boolean {
  const curator = user?.id === process.env.NEXT_PUBLIC_CURATOR_USER_ID;

  if ((visibility === "system" && curator) || visibility !== "system") {
    return true;
  }

  return false;
}
