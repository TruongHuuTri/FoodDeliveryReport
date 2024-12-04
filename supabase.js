export const supabaseFetch = async (endpoint, method = 'GET', body = null) => {
  const supabaseUrl = 'https://xjmjzdsqbbssdiuhowhz.supabase.co';
  const supabaseApiKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqbWp6ZHNxYmJzc2RpdWhvd2h6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzMzMzQxNywiZXhwIjoyMDQ4OTA5NDE3fQ.OFarEHN3ZJyewE1kl7e9Ncei0l3KzBmbUQWmwcrVEVk'; // Đảm bảo dùng Service Role Key

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseApiKey,
        Authorization: `Bearer ${supabaseApiKey}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    // Kiểm tra nếu phản hồi không thành công
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lỗi từ Supabase API:', errorText);
      throw new Error(errorText || 'Unknown Supabase error');
    }

    // Kiểm tra nếu phản hồi rỗng
    const text = await response.text();
    if (!text) {
      console.warn('Phản hồi rỗng từ Supabase API.');
      return { success: true, message: 'Resource created successfully' }; // Trả về mặc định
    }

    // Parse JSON nếu có dữ liệu
    const json = JSON.parse(text);
    return json;
  } catch (error) {
    console.error('Lỗi khi gọi Supabase API:', error);
    throw error;
  }
};
