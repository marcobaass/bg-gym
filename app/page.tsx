import React from 'react';
import BoardRenderer from "@/components/BoardRenderer";
// Assume these imports are correct based on your file structure:
import { createBoardStateFromXgid } from '@/utils/xgid-parser';
import { BoardState, PositionAnalysis } from '@/types/board';

// Sample XGID (White to play 5-2)
const SAMPLE_XGID = "XGID=-b---BC-A-c--Ac-b--c--a-:-1:1:1:52:0:0:3:0:10";

export default function Home() {
    // 1. Data Generation
    const boardStateData: BoardState = createBoardStateFromXgid(SAMPLE_XGID);

    return (
        <>
            <BoardRenderer
                boardState={boardStateData}
                analysis={boardStateData.analysis}
            />
        </>
    );
}
