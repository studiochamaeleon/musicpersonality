/**
 * YouTube 관련 유틸리티 함수들
 */

// Google Analytics gtag 함수 타입 정의
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      parameters: {
        event_category?: string;
        event_label?: string;
        [key: string]: unknown;
      }
    ) => void;
  }
}

/**
 * 아티스트와 곡명을 기반으로 YouTube 검색 URL을 생성합니다.
 * @param artistName 아티스트 이름
 * @param trackName 곡 제목
 * @returns YouTube 검색 URL
 */
export const generateYouTubeSearchUrl = (artistName: string, trackName: string): string => {
  // "아티스트명 곡명 official" 형태로 검색어 구성
  const searchQuery = `${artistName} ${trackName} official`;
  
  // URL 인코딩 적용
  const encodedQuery = encodeURIComponent(searchQuery);
  
  // YouTube 검색 URL 반환
  return `https://www.youtube.com/results?search_query=${encodedQuery}`;
};

/**
 * 안전하게 외부 링크를 새 탭에서 열기 위한 함수
 * @param url 열려는 URL
 * @param trackName 트랙명 (분석용)
 */
export const openYouTubeLink = (url: string, trackName: string): void => {
  // 분석 이벤트 (있다면)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'youtube_track_click', {
      event_category: 'music_discovery',
      event_label: trackName,
    });
  }
  
  // 새 탭에서 안전하게 열기
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * 아티스트명을 영어로 변환하는 간단한 매핑 (필요시 확장 가능)
 * @param artistNameKo 한국어 아티스트명
 * @returns 영어 아티스트명 또는 원래 이름
 */
export const getEnglishArtistName = (artistNameKo: string): string => {
  const artistMapping: Record<string, string> = {
    '마일스 데이비스': 'Miles Davis',
    '쳇 베이커': 'Chet Baker',
    '존 콜트레인': 'John Coltrane',
    '빌 에반스': 'Bill Evans',
    '찰리 파커': 'Charlie Parker',
    '디지 길레스피': 'Dizzy Gillespie',
    '비틀즈': 'The Beatles',
    '비치 보이스': 'The Beach Boys',
    '마이클 잭슨': 'Michael Jackson',
    '프린스': 'Prince',
    '마돈나': 'Madonna',
    // 필요에 따라 더 추가 가능
  };
  
  return artistMapping[artistNameKo] || artistNameKo;
};