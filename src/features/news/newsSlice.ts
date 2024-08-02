import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';
import { format, parseISO } from 'date-fns';
import { CommentsResponse, IComment, INewsItem, initialNewsState, IRegionsResponse, ISectionResponse, NewsResponse, ReactionPayload } from './newsTypes';
// import authorizedFetch from './authorizedFetch';

const initialState: initialNewsState = {
    newsArr: [],
    status: 'idle',
    selectedNews: null,
    pageCount: 0,
    error: null,
    currentPage: 0,
    comments: [],
    message: null,
    sections: [],
    regions: [],
};

export const formatDate = (dateString: string): string => {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy HH:mm');
};



export const fetchNews = createAsyncThunk<NewsResponse, { page: number }, { state: RootState }>(
    'news/fetchNews', async ({ page }) => {
        const data = (await axios.get<NewsResponse>(`/api/news?page=${page}`)).data;
        return data;
    });
export const fetchNewsById = createAsyncThunk<INewsItem, number, { state: RootState }>(
    'news/fetchNewsById', async (id) => {
        const data = (await axios.get<INewsItem>(`/api/news/${id}`)).data;
        return data;
    }
);
export const fetchPutReaction = createAsyncThunk<INewsItem, ReactionPayload, { state: RootState }>(
    'news/fetchPutReaction', async (payload) => {
        const { newsId, liked, disliked } = payload;
        const data = (await axios.put<INewsItem>(`/api/news/reaction`, { newsId, liked, disliked })).data;
        return data;
    }
);
export const fetchComments = createAsyncThunk<CommentsResponse, number, { state: RootState }>(
    'news/fetchComments', async (newsId, { rejectWithValue }) => {
        try {
            const data = (await axios.get<IComment[]>(`/api/news/${newsId}/comments`)).data;
            return { comments: data };
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                //если ненайдено, то возвращаем 404. и присваеваем пустой массив комментариев
                return { comments: [] };
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);
export const fetchSections = createAsyncThunk<ISectionResponse[], void, { state: RootState }>(
    'news/fetchSections',
    async () => {
        const data = (await axios.get<ISectionResponse[]>('/api/sections')).data;
        return data;
    }
);
export const fetchRegions = createAsyncThunk<IRegionsResponse[], void, { state: RootState }>(
    'news/fetchRegions',
    async () => {
        const data = (await axios.get<IRegionsResponse[]>('/api/regions')).data;
        return data;
    }
);
// export const addComment = createAsyncThunk<
//   { message: string; comment?: IComment },
//   INewsCommentRequest,
//   { rejectValue: { message: string } }
// >(
//   'news/addComment',
//   async (commentData, { rejectWithValue }) => {
//     try {
//       const response = await authorizedFetch(`/api/news/comment`, {
//         method: 'PUT',
//         body: JSON.stringify(commentData),
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.json();
//       if (!response.ok) {
//         return rejectWithValue({ message: data.message || 'Failed to add comment' });
//       }
//       return data;
//     } catch (error: any) {
//       return rejectWithValue({ message: error.message });
//     }
//   }
// );

export const fetchFilteredNews = createAsyncThunk<NewsResponse, { page: number; section?: string; region?: string }, { state: RootState }>(
    'news/fetchFilteredNews',
    async ({ page, section = '', region = '' }) => {
        const params = new URLSearchParams({
            page: page.toString(),
            section,
            region
        });

        const response = await axios.get<NewsResponse>(`/api/news/findBy?${params.toString()}`);
        return response.data;
    }
);

export const editComment = createAsyncThunk<IComment, { commentId: number, comment: string }, { state: RootState }>(
    'news/editComment', async ({ commentId, comment }) => {
        const response = await axios.put<IComment>(`/api/news/comment`, { commentId, comment });
        return response.data;
    }
);

export const deleteComment = createAsyncThunk<{ commentId: number }, { commentId: number }, { state: RootState }>(
    'news/deleteComment', async ({ commentId }) => {
        await axios.delete(`/api/news/comment`, { data: { commentId } });
        return { commentId };
    }
);
// export const fetchRegionsBySection = createAsyncThunk<
// NewsResponse,
//     { sectionName: string; regionName: string },
//     { state: RootState }
// >(
//     'news/fetchRegionsBySection', async ({ sectionName, regionName }) => {
//         const data = (await axios.get<NewsResponse[]>(`/api/news/findBy?page=0&section=${sectionName}&region=${regionName}`)).data;
//         return data;
//     }
// );

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNews.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.status = 'success';
                // state.newsArr = action.payload;
                // state.sections = Array.from(new Set(action.payload.map(news => news.sectionName)));

                state.newsArr = action.payload.newsDataPage;
                const sectionsSet = new Set<string>();
                const regionsSet = new Set<string>();

                action.payload.newsDataPage.forEach(news => {
                    sectionsSet.add(news.sectionName);
                    regionsSet.add(news.regionName);
                });

            
                state.pageCount = action.payload.pageCount;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.status = 'error';
                console.error("Failed to fetch news:", action.error.message);
            })
            .addCase(fetchNewsById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNewsById.fulfilled, (state, action) => {
                state.status = 'success';
                state.selectedNews = action.payload;
            })
            .addCase(fetchNewsById.rejected, (state, action) => {
                state.status = 'error';
                console.error("Failed to fetch news by ID:", action.error.message);
            })

            .addCase(fetchComments.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.status = 'success';
                state.comments = action.payload.comments || [];
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.status = 'error';
                console.error("Failed to fetch comments by newsID::", action.error.message);
            })
            .addCase(fetchPutReaction.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPutReaction.fulfilled, (state, action) => {
                state.status = 'success';
                state.selectedNews = action.payload;
            })
            .addCase(fetchPutReaction.rejected, (state, action) => {
                state.status = 'error';
                console.error('Failed to put reaction:', action.error.message);
            })
            .addCase(fetchFilteredNews.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFilteredNews.fulfilled, (state, action) => {
                state.status = 'success';
                state.newsArr = action.payload.newsDataPage;
                state.pageCount = action.payload.pageCount;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchFilteredNews.rejected, (state, action) => {
                state.status = 'error';
                console.error("Failed to fetch filtered news:", action.error.message);
            })
            .addCase(fetchRegions.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.regions = action.payload.map(region => region.regionName);
                state.status = 'success';
            })
            .addCase(fetchRegions.rejected, (state, action) => {
                state.status = 'error';
                console.error("Failed to fetch regions:", action.error.message);
            })
            .addCase(fetchSections.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSections.fulfilled, (state, action) => {
                state.sections = action.payload.map(section => section.sectionName);
                state.status = 'success';
            })
            .addCase(fetchSections.rejected, (state, action) => {
                state.status = 'error';
                console.error("Failed to fetch sections:", action.error.message);
            })
            .addCase(editComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex(comment => comment.id === action.payload.id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter(comment => comment.id !== action.payload.commentId);
            })
            // .addCase(addComment.pending, (state) => {
            //     state.status = 'loading';
            //   })
            //   .addCase(addComment.fulfilled, (state, action) => {
            //     state.status = 'success';
            //     state.message = action.payload.message;
            //     if (action.payload.comment && state.newsArr) {
            //       state.newsArr.comments.unshift(action.payload.comment);
            //     }
            //   })
            //   .addCase(addComment.rejected, (state, action) => {
            //     state.status = 'error';
            //     state.error = action.payload?.message || 'An error occurred';
            //   })

    }
})

export default newsSlice.reducer;



