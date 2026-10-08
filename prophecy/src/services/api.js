const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getFortuneTelling(userData, onMessage, onError) {
    try {
        // 构造用户输入字符串
        const userInput = `姓名：${userData.name}，性别：${userData.gender}，出生日期：${userData.birthDate}，出生时辰：${userData.birthTime}`;
        
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_input: userInput
            })
        });

        if (!response.ok) {
            throw new Error('网络请求失败');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            
            // 解码二进制数据
            const chunk = decoder.decode(value);
            
            // 处理每个数据块
            try {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6); // 移除 "data: " 前缀
                        try {
                            const data = JSON.parse(jsonStr);
                            onMessage(data);
                        } catch {
                            // 如果不是JSON格式，直接发送原始文本
                            onMessage(jsonStr);
                        }
                    }
                }
            } catch (error) {
                console.error('处理数据块失败:', error);
                onMessage(chunk);
            }
        }
    } catch (error) {
        console.error('请求失败:', error);
        onError?.(error);
    }

    return {
        close: () => {} // 由于使用 fetch，连接会自动关闭
    };
} 