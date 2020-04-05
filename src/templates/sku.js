function objEquals(object1, object2) {
    for (let propName in object1) {
        if (object1.hasOwnProperty(propName) !== object2.hasOwnProperty(propName)) {
            return false
        } else if (typeof object1[propName] !== typeof object2[propName]) {
            return false
        }
    }
    for (let propName in object2) {
        if (object1.hasOwnProperty(propName) !== object2.hasOwnProperty(propName)) {
            return false
        } else if (typeof object1[propName] !== typeof object2[propName]) {
            return false
        }
        if (!object1.hasOwnProperty(propName)) {
            continue
        }
        if (object1[propName] instanceof Array && object2[propName] instanceof Array) {
            if (objEquals(!object1[propName], object2[propName])) {
                return false
            }
        } else if (object1[propName] instanceof Object && object2[propName] instanceof Object) {
            if (objEquals(!object1[propName], object2[propName])) {
                return false
            }
        } else if (object1[propName] !== object2[propName]) {
            return false
        }
    }
    return true
}

Vue.component('sku', {
    props: [
        'title',
        'value',
        'specs',
        'customSpec',
        'specData',
        'defaultProductNo',// 默认商品编号
    ],
    data: function () {
        return {
            cacheSpecification: [], // 缓存规格名称
            isSetListShow: true, // 批量设置相关
            batchValue: '', // 批量设置所绑定的值
            currentType: '', // 要批量设置的类型
            // 用来存储要添加的规格属性
            addValues: [],
            sku: {
                // 规格
                specification: [],
                // 子规格
                childProductArray: []
            }
        }
    },
    computed: {
        // 所有sku的id
        stockSpecArr: function () {
            var rs = this.sku.childProductArray.map(function (item) {
                return item.spec
            })
            this.$emit('input', this.sku);
            return rs;
        }
    },
    created: function () {
        if (!this.defaultProductNo) {
            this.defaultProductNo = 'PRODUCTNO_';
        }
        this.createData()
    },
    methods: {
        // 创建模拟数据
        createData: function () {
            if (!this.specs) {
                return false
            }
            let _this = this
            this.specs.map(function (item, i) {
                // 添加数据
                _this.addSpec()
                // 数据
                _this.sku.specification[i].name = item.name
                _this.addValues[i] = item.value
                // 缓存按钮键值
                _this.cacheSpecification[i].status = false
                _this.cacheSpecification[i].name = item.name
                // 构建
                _this.addSpecTag(i)
            })
            this.sku.childProductArray.map(function (item, i) {
                _this.sku.childProductArray[i] = _this.specData[i]
            })
        },
        // 添加规格项目
        addSpec: function () {
            this.cacheSpecification.push({
                status: true,
                name: ''
            })
            this.sku.specification.push({
                name: '',
                value: []
            })
        },
// 修改状态
        updateSpec: function (index) {
            this.cacheSpecification[index].status = true
            this.cacheSpecification[index].name = this.sku.specification[index].name
        },
// 保存规格名
        saveSpec: function (index) {
            if (!this.cacheSpecification[index].name.trim()) {
                this.$message.error('名称不能为空，请注意修改')
                return
            }
// 保存需要验证名称是否重复
            if (this.sku.specification[index].name === this.cacheSpecification[index].name) {
                this.cacheSpecification[index].status = false
            } else {
                if (this.verifyRepeat(index)) {
// 如果有重复的，禁止修改
                    this.$message.error('名称重复，请注意修改')
                } else {
                    this.sku.specification[index].name = this.cacheSpecification[index].name
                    this.cacheSpecification[index].status = false
                }
            }
        },
// 删除规格项目
        delSpec: function (index) {
            this.sku.specification.splice(index, 1)
            this.handleSpecChange('del')
        },
        verifyRepeat: function (index) {
            let flag = false
            let _this = this
            this.sku.specification.forEach(function (value, j) {
// 检查除了当前选项以外的值是否和新的值想等，如果相等，则禁止修改
                if (index !== j
                ) {
                    if (_this.sku.specification[j].name === _this.cacheSpecification[index].name) {
                        flag = true
                    }
                }
            })
            return flag
        },
// 添加规格属性
        addSpecTag: function (index) {
            let str = this.addValues[index] || ''
            if (!str.trim() || !this.cacheSpecification[index].name.trim()) {
                this.$message.error('名称不能为空，请注意修改')
                return
            } // 判空
            str = str.trim()
            let arr = str.split(/\s+/) // 使用空格分割成数组
            let newArr = this.sku.specification[index].value.concat(arr)
            newArr = Array.from(new Set(newArr)) // 去重
            this.$set(this.sku.specification[index], 'value', newArr)
            this.clearAddValues(index)
            this.handleSpecChange('add')
            this.sku.specification[index].name = this.cacheSpecification[index].name
            this.cacheSpecification[index].status = false
        },
// 删除规格属性
        delSpecTag: function (index, num) {
            this.sku.specification[index].value.splice(num, 1)
            this.handleSpecChange('del')
        },
// 清空 addValues
        clearAddValues: function (index) {
            this.$set(this.addValues, index, '')
        },
        /*
        根据传入的属性值，拿到相应规格的属性
        @params
        specIndex 规格项目在 advancedSpecification 中的序号
        index 所有属性在遍历时的序号
        */
        getSpecAttr: function (specIndex, index) {
// 获取当前规格项目下的属性值
            const currentValues = this.sku.specification[specIndex].value
            let indexCopy
// 判断是否是最后一个规格项目
            if (this.sku.specification[specIndex + 1] && this.sku.specification[specIndex + 1].value.length) {
                indexCopy = index / this.countSum(specIndex + 1)
            } else {
                indexCopy = index
            }
            const i = Math.floor(indexCopy % currentValues.length)
            if (i.toString() !== 'NaN') {
                return currentValues[i]
            } else {
                return ''
            }
        },
        /*
        计算属性的乘积
        @params
        specIndex 规格项目在 advancedSpecification 中的序号
        */
        countSum: function (specIndex) {
            let num = 1
            this.sku.specification.forEach(function (item, index) {
                if (index >= specIndex && item.value.length) {
                    num *= item.value.length
                }
            })
            return num
        },
// 根据传入的条件，来判断是否显示该td
        showTd: function (specIndex, index) {
// 如果当前项目下没有属性，则不显示
            if (!this.sku.specification[specIndex]) {
                return false
// 自己悟一下吧
            } else if (index % this.countSum(specIndex + 1) === 0) {
                return true
            } else {
                return false
            }
        },
        /**
         * [handleSpecChange 监听标签的变化,当添加标签时；求出每一行的hash id，再动态变更库存信息；当删除标签时，先清空已有库存信息，然后将原有库存信息暂存到stockCopy中，方便后面调用]
         * @param  {[string]} option ['add'|'del' 操作类型，添加或删除]
         * @return {[type]}        [description]
         */
        handleSpecChange: function (option) {
            const stockCopy = JSON.parse(JSON.stringify(this.sku.childProductArray))
            if (option === 'del') {
                this.sku.childProductArray = []
            }
            for (let i = 0; i < this.countSum(0); i++) {
                this.changeStock(option, i, stockCopy)
            }
        },
        /**
         * [根据规格，动态改变库存相关信息]
         * @param  {[string]} option    ['add'|'del' 操作类型，添加或删除]
         * @param  {[array]} stockCopy [库存信息的拷贝]
         * @return {[type]}           [description]
         */
        changeStock: function (option, index, stockCopy) {
            let childProduct = {
                id: 0,
                spec: this.getspec(index),
                product_no: this.defaultProductNo + index,
                stock: 0,
                price: 0,
                price_origin: 0,
                enable: 1
            }
            let _this = this
            const spec = childProduct.spec
            if (option === 'add') {
// 如果此id不存在，说明为新增属性，则向 childProductArray 中添加一条数据
                if (this.stockSpecArr.findIndex(function (item) {
                    return objEquals(spec, item)
                }) === -1) {
                    _this.$set(_this.sku.childProductArray, index, childProduct)
                }
            } else if (option === 'del') {
// 因为是删除操作，理论上所有数据都能从stockCopy中获取到
                let origin = ''
                stockCopy.forEach(function (item) {
                    if (objEquals(spec, item.spec)) {
                        origin = item
                        return false
                    }
                })
                this.sku.childProductArray.push(origin || childProduct)
            }
        },
// 获取childProductArray的spec属性
        getspec: function (index) {
            let obj = {}
            let _this = this
            this.sku.specification.forEach(function (item, specIndex) {
                obj[item.name] = _this.getSpecAttr(specIndex, index)
            })
            return obj
        },
// 监听规格启用操作
// 监听商品编号的blur事件
        handleNo: function (index) {
// 1.当用户输入完商品编号时，判断是否重复，如有重复，则提示客户并自动修改为不重复的商品编号
            const value = this.sku.childProductArray[index].product_no
            let isRepet
            this.sku.childProductArray.forEach(function (item, i) {
                if (item.product_no === value && i !== index) {
                    isRepet = true
                }
            })
            if (isRepet) {
                this.$message({
                    type: 'warning',
                    message: '不允许输入重复的商品编号'
                })
                this.$set(this.sku.childProductArray[index], 'product_no', this.makeProductNoNotRepet(index))
            }
        },
// 生成不重复的商品编号
        makeProductNoNotRepet: function (index) {
            let No
            let i = index
            let isRepet = true
            while (isRepet) {
                No = this.defaultProductNo + i
                isRepet = this.isProductNoRepet(No)
                i++
            }
            return No
        },
// 商品编号判重
        isProductNoRepet: function (No) {
            const result = this.sku.childProductArray.findIndex(function (item) {
                return item.product_no === No
            })
            return result > -1
        },
// 打开设置框
        openBatch: function (type) {
            this.currentType = type
            this.isSetListShow = false
        },
// 批量设置
        setBatch: function () {
            if (typeof this.batchValue === 'string') {
                this.$message({
                    type: 'warning',
                    message: '请输入正确的值'
                })
                return
            }
            let _this = this
            this.sku.childProductArray.forEach(function (item) {
                if (item.enable === 1) {
                    item[_this.currentType] = _this.batchValue
                }
            })
            this.cancelBatch()
        },
// 取消批量设置
        cancelBatch: function () {
            this.batchValue = ''
            this.currentType = ''
            this.isSetListShow = true
        }
    },
    template: `
<div class="vue-sku">
    <el-card class="box-card" v-if="customSpec">
        <div slot="header" class="clearfix">
            <span>{{title ? title : '规格设置'}}</span>
           <el-button size="small" type="primary" :disabled="sku.specification.length >= 5" @click="addSpec">
                添加规格项目
            </el-button>
        </div>
        <section>
            <div v-for="(item, index) in sku.specification" :key="index" class="spec-line">
                <span v-if="!cacheSpecification[index].status">{{ item.name }}</span>
                <el-input size="small" style="width:200px;" v-if="cacheSpecification[index].status"
                          v-model="cacheSpecification[index].name" placeholder="输入产品规格"
                          @keyup.native.enter="saveSpec(index)">
                    <el-button slot="append" icon="el-icon-check" type="primary"
                               @click="saveSpec(index)"></el-button>
                </el-input>
                <i class="icon el-icon-edit" v-if="!cacheSpecification[index].status"
                   @click="updateSpec(index)"></i>
                ：
                <el-tag v-for="(tag, j) in item.value" :key="j" closable @close="delSpecTag(index, j)">{{ tag
                    }}
                </el-tag>
                <el-input size="small" style="width:200px; vertical-align: middle" v-model="addValues[index]" placeholder="多个产品属性以空格隔开"
                          @keyup.native.enter="addSpecTag(index)">
                    <el-button slot="append" icon="el-icon-check" type="primary"
                               @click="addSpecTag(index)"></el-button>
                </el-input>
                <i class="icon el-icon-circle-close spec-deleted" @click="delSpec(index)"></i>
            </div>
        </section>
    </el-card>

    <el-card>
        <table class="el-table vue-sku-table" cellspacing="0" cellpadding="0">
            <thead>
            <tr>
                <th
                        v-for="(item, index) in sku.specification"
                        :key="index">
                    {{item.name}}
                </th>
                <th style="width: 160px;">规格编码</th>
                <th>成本价（元）</th>
                <th>库存</th>
                <th>销售价（元）</th>
                <th>是否启用</th>
            </tr>
            </thead>
            <tbody v-if="sku.specification[0] && sku.specification[0].value.length">
            <tr
                    :key="index"
                    v-for="(item, index) in countSum(0)">
                <template v-for="(n, specIndex) in sku.specification.length">
                    <td
                            v-if="showTd(specIndex, index)"
                            :key="n"
                            :rowspan="countSum(n)">
                        {{getSpecAttr(specIndex, index)}}
                    </td>
                </template>
                <td>
                    <el-input
                            size="small"
                            type="text"
                            :disabled="sku.childProductArray[index].enable !== 1"
                            v-model="sku.childProductArray[index].product_no"
                            @blur="handleNo(index)"
                            placeholder="输入商品规格编号">
                    </el-input>
                </td>
                <td>
                    <el-input
                            size="small"
                            type="text"
                            v-model.number="sku.childProductArray[index].price_origin"
                            placeholder="输入市场价"
                            :disabled="sku.childProductArray[index].enable !== 1">
                    </el-input>
                </td>
                <td>
                    <el-input
                            size="small"
                            type="text"
                            v-model.number="sku.childProductArray[index].stock"
                            placeholder="输入库存"
                            :disabled="sku.childProductArray[index].enable !== 1">
                    </el-input>
                </td>
                <td>
                    <el-input
                            size="small"
                            type="text"
                            v-model.number="sku.childProductArray[index].price"
                            placeholder="输入销售价"
                            :disabled="sku.childProductArray[index].enable !== 1">
                    </el-input>
                </td>
                <td>
                    <el-switch v-model="sku.childProductArray[index].enable" :active-value=1 :inactive-value=2></el-switch>
                </td>
            </tr>
            <tr>
                <td colspan="8" class="wh-foot">
                    <span class="label">批量设置：</span>
                    <template v-if="isSetListShow">
                        <el-button @click="openBatch('price_origin')" size="mini">市场价</el-button>
                        <el-button @click="openBatch('stock')" size="mini">库存</el-button>
                        <el-button @click="openBatch('price')" size="mini">销售价</el-button>
                    </template>
                    <template v-else>
                        <el-input size="mini" style="width:200px;" v-model.number="batchValue"
                                  placeholder="输入要设置的数量"></el-input>
                        <el-button type="primary" size="mini" @click="setBatch"><i
                                class="set-btn blue el-icon-check"></i></el-button>
                        <el-button type="danger" size="mini" @click="cancelBatch"><i
                                class="set-btn blue el-icon-close"></i></el-button>
                    </template>
                </td>
            </tr>
            </tbody>

        </table>
    </el-card>

</div>
`
})