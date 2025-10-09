




// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import apiClient from '../../api/apiClient';
// import './StatisticsPage.css';
// import { toast } from 'react-toastify';
// const Pagination = ({ currentPage, totalPages, onPageChange }) => {
//     // ... component này giữ nguyên, không cần sửa ...
//     const pageNumbers = []; const maxVisiblePages = 5; let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)); let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); if (endPage - startPage + 1 < maxVisiblePages) { startPage = Math.max(1, endPage - maxVisiblePages + 1); } for (let i = startPage; i <= endPage; i++) { pageNumbers.push(i); } if (totalPages <= 1) { return null; }
//     return (
//         <nav className="pagination-container">
//             <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="pagination-first">&#8249;&#8249; Đầu</button>
//             <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&#8249; Trước</button>
//             {startPage > 1 && (<><button onClick={() => onPageChange(1)}>1</button>{startPage > 2 && <span className="pagination-ellipsis">...</span>}</>)}
//             {pageNumbers.map(number => (<button key={number} onClick={() => onPageChange(number)} className={currentPage === number ? 'active' : ''}>{number}</button>))}
//             {endPage < totalPages && (<>{endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}<button onClick={() => onPageChange(totalPages)}>{totalPages}</button></>)}
//             <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau &#8250;</button>
//             <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="pagination-last">Cuối &#8250;&#8250;</button>
//         </nav>
//     );
// };

// const StatisticsPage = () => {
//     const [checkInData, setCheckInData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [deleting, setDeleting] = useState(null);

//     const ITEMS_PER_PAGE = 25;

//     const formatDateTime = (dateString) => {
//         const date = new Date(dateString);
//         return `${date.toLocaleTimeString('vi-VN')} ${date.toLocaleDateString('vi-VN')}`;
//     };

//     const fetchCheckInData = useCallback(async () => {
//         try {
//             setLoading(true);
//             const cacheBuster = `?_t=${new Date().getTime()}`;
//             const response = await apiClient.get('/system-admin/check-in-statistics' + cacheBuster);
//             setCheckInData(response.data);
//         } catch (error) {
//             console.error('Failed to fetch check-in data:', error);
//             if (error.response?.status === 401) {
//                 toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
//                 window.location.href = '/system-admin/login';
//             } else {
//                 toast.error('Lỗi khi tải dữ liệu điểm danh');
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchCheckInData();
//     }, [fetchCheckInData]);

//     const { currentTableData, totalPages } = useMemo(() => {
//         const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//         const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
//         const dataForPage = checkInData.slice(firstPageIndex, lastPageIndex);
//         const pages = Math.ceil(checkInData.length / ITEMS_PER_PAGE);
//         return { currentTableData: dataForPage, totalPages: pages };
//     }, [checkInData, currentPage]);

//     const handlePageChange = useCallback((page) => {
//         setCurrentPage(page);
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     }, []);

//     // --- SỬA LẠI HOÀN TOÀN HÀM handleDeleteRecord ---
//     const handleDeleteRecord = async (recordToDelete) => {
//         const recordId = recordToDelete.id || recordToDelete._id; // <-- SỬA CHÍNH Ở ĐÂY

//         if (!recordId) {
//             toast.error("Lỗi: Không tìm thấy ID của bản ghi.");
//             return;
//         }

//         if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
//             try {
//                 setDeleting(recordId);
//                 await apiClient.delete(`/system-admin/check-in-statistics/${recordId}`);
// toast.success('Đã xóa bản ghi thành công !');
//                 setCheckInData(prevData => {
//                     const newData = prevData.filter(item => (item.id || item._id) !== recordId); // <-- SỬA CHÍNH Ở ĐÂY
//                     const newTotalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);
//                     if (currentPage > newTotalPages && newTotalPages > 0) {
//                         setCurrentPage(newTotalPages);
//                     }
//                     return newData;
//                 });
//             } catch (error) {
//                 console.error('Delete error:', error);
//                 toast.error('Lỗi khi xóa: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
//             } finally {
//                 setDeleting(null);
//             }
//         }
//     };
//     // --- KẾT THÚC SỬA ---

//     const handleClearAll = async () => {
//         if (window.confirm('Bạn có chắc muốn xóa TẤT CẢ bản ghi điểm danh? Hành động này không thể hoàn tác!')) {
//             try {
//                 setLoading(true);
//                 await apiClient.delete('/system-admin/check-in-statistics');
//                 setCheckInData([]);
//                 setCurrentPage(1);
//                 toast.success('Đã xóa tất cả bản ghi!');
//             } catch (error) {
//                 console.error('Clear all error:', error);
//                 toast.error('Lỗi khi xóa: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
//                 fetchCheckInData();
//             } finally {
//                 setLoading(false);
//             }
//         }
//     };

//     if (loading) return <div className="loading-message"><div className="loading-spinner"></div><h2>Đang tải dữ liệu...</h2></div>;

//     return (
//         <div className="statistics-page-container">
//             <div className="statistics-header">
//                 <h2>Thống kê điểm danh sự kiện</h2>
//                 <div className="statistics-actions">
//                     <span className="total-count">Tổng: {checkInData.length} lượt check-in</span>
//                     <button onClick={fetchCheckInData} className="refresh-btn" disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
//                     <button onClick={handleClearAll} className="clear-all-btn" disabled={loading || checkInData.length === 0}>Xóa tất cả</button>
//                 </div>
//             </div>

//             {checkInData.length > 0 ? (
//                 <>
//                     <div className="table-wrapper">
//                         <table className="statistics-table">
//                             <thead>
//                                 <tr>
//                                     <th>STT</th>
//                                     <th>Ảnh</th>
//                                     <th>Tên</th>
//                                     <th>Vai trò</th>
//                                     <th>Công ty</th>
//                                     <th>Chức vụ</th>
//                                     <th>Thời gian check-in</th>
//                                     <th>Thao tác</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {currentTableData.map((item, index) => {
//                                     const overallIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
//                                     const itemId = item.id || item._id; // <-- SỬA CHÍNH Ở ĐÂY
//                                     const isDeleting = deleting === itemId;
//                                     return (
//                                         <tr key={itemId} className={isDeleting ? 'deleting' : ''}>
//                                             <td>{overallIndex}</td>
//                                             <td>
//                                                 {item.user_image_base64 ? (<img src={`data:image/jpeg;base64,${item.user_image_base64}`} alt={item.user_name} width="50" height="50" className="table-avatar" />) : (<div className="table-avatar-placeholder">?</div>)}
//                                             </td>
//                                             <td>{item.user_name}</td>
//                                             <td>{item.user_role || '-'}</td>
//                                             <td>{item.user_company || '-'}</td>
//                                             <td>{item.user_position || '-'}</td>
//                                             <td>{formatDateTime(item.check_in_time)}</td>
//                                             <td>
//                                                 <button onClick={() => handleDeleteRecord(item)} className="delete-btn" disabled={isDeleting}> {/* <-- SỬA CHÍNH Ở ĐÂY */}
//                                                     {isDeleting ? 'Đang xóa...' : 'Xóa'}
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                     {totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />)}
//                 </>
//             ) : (
//                 <div className="no-data-message"><p>Chưa có dữ liệu điểm danh.</p></div>
//             )}
//         </div>
//     );
// };

// export default StatisticsPage;


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';
import './StatisticsPage.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = []; const maxVisiblePages = 5; let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2)); let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); if (endPage - startPage + 1 < maxVisiblePages) { startPage = Math.max(1, endPage - maxVisiblePages + 1); } for (let i = startPage; i <= endPage; i++) { pageNumbers.push(i); } if (totalPages <= 1) { return null; }
    return (
        <nav className="pagination-container">
            <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="pagination-first">&#8249;&#8249; Đầu</button>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>&#8249; Trước</button>
            {startPage > 1 && (<><button onClick={() => onPageChange(1)}>1</button>{startPage > 2 && <span className="pagination-ellipsis">...</span>}</>)}
            {pageNumbers.map(number => (<button key={number} onClick={() => onPageChange(number)} className={currentPage === number ? 'active' : ''}>{number}</button>))}
            {endPage < totalPages && (<>{endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}<button onClick={() => onPageChange(totalPages)}>{totalPages}</button></>)}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau &#8250;</button>
            <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="pagination-last">Cuối &#8250;&#8250;</button>
        </nav>
    );
};

const StatisticsPage = () => {
    const [checkInData, setCheckInData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleting, setDeleting] = useState(null);

    const ITEMS_PER_PAGE = 25;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleTimeString('vi-VN')} ${date.toLocaleDateString('vi-VN')}`;
    };

    const fetchCheckInData = useCallback(async () => {
        try {
            setLoading(true);
            const cacheBuster = `?_t=${new Date().getTime()}`;
            const response = await apiClient.get('/system-admin/check-in-statistics' + cacheBuster);
            setCheckInData(response.data);
        } catch (error) {
            console.error('Failed to fetch check-in data:', error);
            if (error.response?.status === 401) {
                toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                setTimeout(() => { window.location.href = '/system-admin/login'; }, 2000);
            } else {
                toast.error('Lỗi khi tải dữ liệu điểm danh');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCheckInData();
    }, [fetchCheckInData]);

    const { currentTableData, totalPages } = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        const dataForPage = checkInData.slice(firstPageIndex, lastPageIndex);
        const pages = Math.ceil(checkInData.length / ITEMS_PER_PAGE);
        return { currentTableData: dataForPage, totalPages: pages };
    }, [checkInData, currentPage]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDeleteRecord = async (recordToDelete) => {
        const recordId = recordToDelete.id || recordToDelete._id;

        if (!recordId) {
            toast.error("Lỗi: Không tìm thấy ID của bản ghi.");
            return;
        }

        if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
            try {
                setDeleting(recordId);
                await apiClient.delete(`/system-admin/check-in-statistics/${recordId}`);

                toast.success('Đã xóa bản ghi thành công!');

                setCheckInData(prevData => {
                    const newData = prevData.filter(item => (item.id || item._id) !== recordId);
                    const newTotalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                    return newData;
                });
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Lỗi khi xóa: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
            } finally {
                setDeleting(null);
            }
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Bạn có chắc muốn xóa TẤT CẢ bản ghi điểm danh? Hành động này không thể hoàn tác!')) {
            try {
                setLoading(true);
                await apiClient.delete('/system-admin/check-in-statistics');
                setCheckInData([]);
                setCurrentPage(1);
                toast.success('Đã xóa tất cả bản ghi!');
            } catch (error) {
                console.error('Clear all error:', error);
                toast.error('Lỗi khi xóa: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
                fetchCheckInData();
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <div className="loading-message"><div className="loading-spinner"></div><h2>Đang tải dữ liệu...</h2></div>;

    return (
        <div className="statistics-page-container">
            <div className="statistics-header">
                <h2>Thống kê điểm danh sự kiện</h2>
                <div className="statistics-actions">
                    <span className="total-count">Tổng: {checkInData.length} lượt check-in</span>
                    <button onClick={fetchCheckInData} className="refresh-btn" disabled={loading}>{loading ? 'Đang tải...' : 'Làm mới'}</button>
                    <button onClick={handleClearAll} className="clear-all-btn" disabled={loading || checkInData.length === 0}>Xóa tất cả</button>
                </div>
            </div>

            {checkInData.length > 0 ? (
                <>
                    <div className="table-wrapper">
                        <table className="statistics-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ảnh</th>
                                    <th>Tên</th>
                                    <th>Vai trò</th>
                                    <th>Công ty</th>
                                    <th>Chức vụ</th>
                                    <th>Thời gian check-in</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTableData.map((item, index) => {
                                    const overallIndex = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                                    const itemId = item.id || item._id;
                                    const isDeleting = deleting === itemId;
                                    return (
                                        <tr key={itemId} className={isDeleting ? 'deleting' : ''}>
                                            <td>{overallIndex}</td>
                                            <td>
                                                {item.user_image_base64 ? (<img src={`data:image/jpeg;base64,${item.user_image_base64}`} alt={item.user_name} width="50" height="50" className="table-avatar" />) : (<div className="table-avatar-placeholder">?</div>)}
                                            </td>
                                            <td>{item.user_name}</td>
                                            <td>{item.user_role || '-'}</td>
                                            <td>{item.user_company || '-'}</td>
                                            <td>{item.user_position || '-'}</td>
                                            <td>{formatDateTime(item.check_in_time)}</td>
                                            <td>
                                                <button onClick={() => handleDeleteRecord(item)} className="delete-btn" disabled={isDeleting}>
                                                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />)}
                </>
            ) : (
                <div className="no-data-message"><p>Chưa có dữ liệu điểm danh.</p></div>
            )}
        </div>
    );
};

export default StatisticsPage;