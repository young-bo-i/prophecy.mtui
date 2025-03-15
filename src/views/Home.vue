<template>
  <div class="home">
    <div class="form-container">
      <h1>AI八字算命</h1>
      
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" finish-status="success" class="steps">
        <el-step title="填写信息"></el-step>
        <el-step title="查看结果"></el-step>
      </el-steps>

      <!-- 第一步：信息填写表单 -->
      <div v-if="currentStep === 0">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="fortune-form"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名"></el-input>
          </el-form-item>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="年龄" prop="age">
            <el-input-number 
              v-model="form.age" 
              :min="1" 
              :max="120"
              placeholder="请输入年龄">
            </el-input-number>
          </el-form-item>

          <el-form-item label="出生日期" prop="birthDate">
            <el-date-picker
              v-model="form.birthDate"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>

          <el-form-item label="出生时辰" prop="birthTime">
            <el-select v-model="form.birthTime" placeholder="请选择出生时辰">
              <el-option label="子时 (23:00-1:00)" value="子"></el-option>
              <el-option label="丑时 (1:00-3:00)" value="丑"></el-option>
              <el-option label="寅时 (3:00-5:00)" value="寅"></el-option>
              <el-option label="卯时 (5:00-7:00)" value="卯"></el-option>
              <el-option label="辰时 (7:00-9:00)" value="辰"></el-option>
              <el-option label="巳时 (9:00-11:00)" value="巳"></el-option>
              <el-option label="午时 (11:00-13:00)" value="午"></el-option>
              <el-option label="未时 (13:00-15:00)" value="未"></el-option>
              <el-option label="申时 (15:00-17:00)" value="申"></el-option>
              <el-option label="酉时 (17:00-19:00)" value="酉"></el-option>
              <el-option label="戌时 (19:00-21:00)" value="戌"></el-option>
              <el-option label="亥时 (21:00-23:00)" value="亥"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm(formRef)">开始算命</el-button>
            <el-button @click="resetForm(formRef)">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 第二步：显示结果 -->
      <div v-else class="result-container">
        <div class="fortune-result">
          <h2>AI算命结果</h2>
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>正在推算命理，请稍候...</p>
          </div>
          <template v-else>
            <div class="user-info">
              <p><strong>姓名：</strong>{{ form.name }}</p>
              <p><strong>性别：</strong>{{ form.gender === 'male' ? '男' : '女' }}</p>
              <p><strong>年龄：</strong>{{ form.age }}岁</p>
              <p><strong>出生日期：</strong>{{ form.birthDate }}</p>
              <p><strong>出生时辰：</strong>{{ form.birthTime }}时</p>
            </div>
            <div class="divider"></div>
            <div class="fortune-content">
              <p>{{ fortuneResult }}</p>
            </div>
          </template>
          <div class="action-buttons">
            <el-button @click="currentStep = 0">返回修改</el-button>
            <el-button type="primary" @click="saveResult">保存结果</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import axios from 'axios'
import config from '../api/config'

const formRef = ref()
const fortuneResult = ref('')
const currentStep = ref(0)
const loading = ref(false)

const form = reactive({
  name: '',
  gender: 'male',
  age: 25,
  birthDate: '',
  birthTime: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, message: '姓名至少2个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 120, message: '年龄必须在1-120岁之间', trigger: 'blur' }
  ],
  birthDate: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  birthTime: [
    { required: true, message: '请选择出生时辰', trigger: 'change' }
  ]
}

const submitForm = async (formEl) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await axios.post(`${config.baseURL}/chat`, {
          user_input: `我的名字是${form.name}，性别${form.gender === 'male' ? '男' : '女'}，
            今年${form.age}岁，出生日期是${form.birthDate}，出生时辰是${form.birthTime}时，
            请根据我的生辰八字帮我算命，给我一个全面的分析。`
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        fortuneResult.value = response.data.response
        currentStep.value = 1
        ElMessage.success('命理推算完成')
      } catch (error) {
        console.error('Error:', error)
        ElMessage.error('推算失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  fortuneResult.value = ''
  currentStep.value = 0
}

const saveResult = () => {
  const content = `
八字算命结果
------------------------
姓名：${form.name}
性别：${form.gender === 'male' ? '男' : '女'}
年龄：${form.age}岁
出生日期：${form.birthDate}
出生时辰：${form.birthTime}时
------------------------
${fortuneResult.value}
  `.trim()

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${form.name}-算命结果.txt`
  link.click()
  window.URL.revokeObjectURL(url)
  ElMessage.success('结果已保存')
}
</script>

<style scoped>
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 2rem 1rem;
}

.form-container {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.steps {
  margin-bottom: 2rem;
}

h1 {
  text-align: center;
  color: #409EFF;
  margin-bottom: 2rem;
}

.fortune-form {
  margin-top: 2rem;
}

.result-container {
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-icon {
  font-size: 2rem;
  color: #409EFF;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.user-info p {
  margin: 0.5rem 0;
}

.divider {
  height: 1px;
  background-color: #dcdfe6;
  margin: 1rem 0;
}

.fortune-content {
  padding: 1rem;
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }

  .el-form-item {
    margin-bottom: 1rem;
  }
}
</style> 