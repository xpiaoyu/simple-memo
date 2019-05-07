# EIS Component 开发学习

### TrainingIntegrationInterfaceComponent 解析

1. 执行 `ComponentInfo load(componentLoadInfo, instanceToBeLoaded)` 这一步会创建一个 dto，并复制 metadata 到新建的 dto 中。

2. 加载 component view 时，执行 `Object getViewModel(ComponentInfo runtimeInstance, List<ComponentInfo> dependencies, ViewType viewType)`，将内部的 service 传入 dto 中。

3. 在 training-integration-interface-component-beans.xml 中，定义了创建 Bean 的一些参数和依赖。

注： 

1. dto 是拥有业务逻辑的 entity，view.xhtml 中引用的 `#{model.xxx}` 都是 entity 和 dto 中的属性。
2. Rules 中的部分函数可以到 `BusinessRulesUtils` 中查找。

----------

### Lookup 创建流程
1. 创建自定义的 LookupValue 类。
2. 创建 LookupTemplate 类。
3. 在 persistence.xml 中注册 Lookup 实例。
4. 注册 Spring Beans。
5. csv 数据文件。
6. 新增 Liquibase 插入 LOOKUPLIST 脚本。

----------

### ConnectionPoints 创建流程

1. component-beans.xml 中定义 `providedConnectionPoints`。
2. 在被连接的 Entity 中定义 `List<SubEntity>`，属性名与 beans.xml 中的 `<entry key="xxx">` 一致。
3. SubEntity 中定义指向 Entity 主键的外键，例如：`Long entityId`，同时编写 LiquiBase 在 SubEntity 对应的表中新增外键字段。

----------

继承 `UniqueBaseEntity` 或者 `BaseEntity` 的类，会有对应的实体表。其他类通常都是在祖先表中添加字段。

`ComponentInfo` 接口两个功能：一是保证实现类有 `ID` 字段。二是保证实现类嵌入了 `ComponentInstanceMetadata` 类。

`UniqueBaseEntity` 两个字段：`oid`, `entityStatus`。

`BaseEntity` 一个字段：`id`。

`ComponentInstanceMetadata` 五个字段：`componentInstanceName`, `producerComponentName`, `producerComponentVersion`, `connectedToInstanceName`, `instanceName`。

----------
<article summary separator>EIS Component 开发学习
TrainingIntegrationInterfaceComponent 解析

执行 ComponentInfo load(componentLoadInfo, instanceToBeLoaded) 这一步会创建一个 dto，并复制 metadata 到新建的 dto 中。

加载 component view 时，执行 Object getViewModel(ComponentInfo runtimeInstance, List<ComponentInfo> dependencies, ViewType viewType)，将内部的 service 传入 dto 中。

在 training-integration-interface-component-beans.xml 中，定义了创建 Bean 的一些参数和依赖。

注：

dto 是拥有业务逻辑的 entity，view.xhtml 中引用的 #{model.xxx} 都是 entity 和 dto 中的属性。
Rules 中的部分函数可以到 BusinessRulesUtils 中查找。
Lookup 创建流程
创建自定义的 LookupValue 类。
创建 LookupTemplate 类。
在 persistence.xml 中注册 Lookup 实例。
注册 Spring Beans。
csv 数据文件。
新增 Liquibase 插入 LOOKUPLIST 脚本。
ConnectionPoints 创建流程
component-beans.xml 中定义 providedConnectionPoints。
在被连接的 Entity 中定义 List<SubEntity>，属性名与 beans.xml 中的 <entry key="xxx"> 一致。
SubEntity 中定义指向 Entity 主键的外键，例如：Long entityId，同时编写 LiquiBase 在 SubEntity 对应的表中新增外键字段。

继承 UniqueBaseEntity 或者 BaseEntity 的类，会有对应的实体表。其他类通常都是在祖先表中添加字段。

ComponentInfo 接口两个功能：一是保证实现类有 ID 字段。二是保证实现类嵌入了 ComponentInstanceMetadata 类。

UniqueBaseEntity 两个字段：oid, entityStatus。

BaseEntity 一个字段：id。

ComponentInstanceMetadata 五个字段：componentInstanceName, producerComponentName, producerComponentVersion, connectedToInstanceName, instanceName。