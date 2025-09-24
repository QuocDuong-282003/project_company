import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import './StatisticsPage.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    // Tính toán range của pages để hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    if (totalPages <= 1) {
        return null;
    }

    return (
        <nav className="pagination-container">
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="pagination-first"
            >
                &#8249;&#8249; Đầu
            </button>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                &#8249; Trước
            </button>

            {startPage > 1 && (
                <>
                    <button onClick={() => onPageChange(1)}>1</button>
                    {startPage > 2 && <span className="pagination-ellipsis">...</span>}
                </>
            )}

            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => onPageChange(number)}
                    className={currentPage === number ? 'active' : ''}
                >
                    {number}
                </button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                    <button onClick={() => onPageChange(totalPages)}>{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Sau &#8250;
            </button>
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-last"
            >
                Cuối &#8250;&#8250;
            </button>
        </nav>
    );
};

const StatisticsPage = () => {
    const [checkInData, setCheckInData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleting, setDeleting] = useState(null); // Track which item is being deleted

    const ITEMS_PER_PAGE = 25;

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${hours}:${minutes} ${day}/${month}/${year}`;
    };

    const fetchCheckInData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/system-admin/check-in-statistics');
            setCheckInData(response.data);

            // Auto-adjust current page if needed
            const totalPages = Math.ceil(response.data.length / ITEMS_PER_PAGE);
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch check-in data:', error);
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/system-admin/login';
            } else {
                alert('Lỗi khi tải dữ liệu điểm danh');
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, ITEMS_PER_PAGE]);

    useEffect(() => {
        fetchCheckInData();
    }, [fetchCheckInData]);

    const { currentTableData, totalPages } = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        const dataForPage = checkInData.slice(firstPageIndex, lastPageIndex);
        const pages = Math.ceil(checkInData.length / ITEMS_PER_PAGE);
        return { currentTableData: dataForPage, totalPages: pages };
    }, [checkInData, currentPage, ITEMS_PER_PAGE]);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        // Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDeleteRecord = async (recordId) => {
        if (window.confirm('Bạn có chắc muốn xóa bản ghi này?')) {
            try {
                setDeleting(recordId);
                await apiClient.delete(`/system-admin/check-in-statistics/${recordId}`);

                // Remove item from local state immediately
                setCheckInData(prevData => {
                    const newData = prevData.filter(item => item.id !== recordId);
                    // Adjust current page if needed
                    const newTotalPages = Math.ceil(newData.length / ITEMS_PER_PAGE);
                    if (currentPage > newTotalPages && newTotalPages > 0) {
                        setCurrentPage(newTotalPages);
                    }
                    return newData;
                });

                alert('Xóa thành công!');
            } catch (error) {
                console.error('Delete error:', error);
                alert('Lỗi khi xóa: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
                // Reload data if delete failed
                fetchCheckInData();
            } finally {
                setDeleting(null);
            }
        }
    };

    const handleClearAll = async () => {
        if (window.confirm('Bạn có chắc muốn xóa TẤT CẢ bản ghi điểm danh?')) {
            try {
                setLoading(true);
                await apiClient.delete('/system-admin/check-in-statistics');
                setCheckInData([]);
                setCurrentPage(1);
                alert('Đã xóa tất cả bản ghi!');
            } catch (error) {
                console.error('Clear all error:', error);
                alert('Lỗi khi xóa: ' + (error.response?.data?.detail || 'Lỗi không xác định'));
                fetchCheckInData();
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return (
        <div className="loading-message">
            <div className="loading-spinner"></div>
            <h2>Đang tải dữ liệu...</h2>
        </div>
    );

    return (
        <div className="statistics-page-container">
            <div className="statistics-header">
                <h2>Thống kê điểm danh sự kiện</h2>
                <div className="statistics-actions">
                    <span className="total-count">
                        Tổng: {checkInData.length} lượt check-in
                        {totalPages > 1 && ` (Trang ${currentPage}/${totalPages})`}
                    </span>
                    <button onClick={fetchCheckInData} className="refresh-btn" disabled={loading}>
                        {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                    <button onClick={handleClearAll} className="clear-all-btn" disabled={loading}>
                        Xóa tất cả
                    </button>
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
                                    const isDeleting = deleting === item.id;

                                    return (
                                        <tr key={item.id} className={isDeleting ? 'deleting' : ''}>
                                            <td>{overallIndex}</td>
                                            <td>
                                                {item.user_image_base64 ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${item.user_image_base64}`}
                                                        alt={item.user_name}
                                                        width="50"
                                                        height="50"
                                                        className="table-avatar"
                                                    />
                                                ) : (
                                                    <div className="table-avatar-placeholder">?</div>
                                                )}
                                            </td>
                                            <td>{item.user_name}</td>
                                            <td>{item.user_role || '-'}</td>
                                            <td>{item.user_company || '-'}</td>
                                            <td>{item.user_position || '-'}</td>
                                            <td>{formatDateTime(item.check_in_time)}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteRecord(item.id)}
                                                    className="delete-btn"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            ) : (
                <div className="no-data-message">
                    <p>Chưa có dữ liệu điểm danh.</p>
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;