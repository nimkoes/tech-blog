# 개요

이 글에서는 기존 Azure 리소스를 Terraform 으로 관리할 수 있도록 해주는 도구인 `Aztfexport` 에 대해 살펴보겠습니다.
이 도구가 무엇인지, 무엇을 할 수 있는지, 그리고 일반적인 사용 흐름(workflow)은 어떤지를 설명한 후,
실제 사용 예제와 함께 단계별 설정 튜토리얼로 넘어가겠습니다.

# Azure Terraform Export 도구란 무엇인가? (이전 명칭: aztfy)

`Aztfexport` 는 Microsoft 에서 개발한 오픈소스 내보내기(export) 도구입니다.
이 도구를 사용하면, 기존에 존재하는 Azure 리소스를 단 한 줄의 명령어로 Terraform 상태 파일로 가져올 수 있으며, 이를 통해 해당 리소스를 Terraform 으로 관리할 수 있게 됩니다.

이 도구의 주요 장점은, 모든 Azure 환경에서 일관되고 자동화된 리소스 관리가 가능하다는 점입니다.
이 도구는 원래 `aztfy` 라는 이름으로 알려져 있었습니다.

Azure Terraform Export 도구는, Azure 에 이미 존재하는 리소스 그룹, 개별 리소스, 또는 Graph 쿼리 문자열을 입력으로 받아, 이를 Terraform 코드로 내보내는 것을 목표로 합니다.

# Azure Terraform Export 도구의 주요 기능 및 장점

`Aztfexport` 를 사용할 경우 다음과 같은 이점을 누릴 수 있습니다.

## 자동화되고 단순화된 가져오기(import) 과정

`Aztfexport` 는 기존 Azure 리소스를 Terraform 으로 전환하는 과정을 간단하고 자동화된 방식으로 처리합니다.
기존에는 상태(state) 등록과 .tf 파일 작성을 별도로 수동 수행해야 했지만, 이 도구는 두 과정을 한 번에 자동 수행합니다.
이를 통해 .tf 설정을 일일이 수작업으로 작성하던 번거로움을 줄일 수 있습니다.

Terraform 을 처음 쓸 때 가장 귀찮고 헷갈리는 부분이 import 명령과 .tf 파일 작성인데, `Aztfexport` 는 이것을 한 번에 처리해 줍니다.
“리소스를 자동으로 상태 등록 + 코드 생성까지” 해준다는 것이 핵심입니다.

## 향상된 인프라 코드(IaC) 도입

Azure 리소스를 Terraform 코드로 내보내는 것은 곧 인프라를 코드로 관리하는 방식(IaC)를 도입하는 것입니다.
이를 통해 인프라 변경은 선언적(declarative)으로 표현되고, 버전 관리되며, 재현 가능해집니다.

이제 인프라 구성도 소스코드처럼 Git으로 관리할 수 있습니다.
“수정 → 저장 → 커밋 → 롤백”이 가능한 인프라가 되는 셈입니다.
즉, 사람이 실수로 포털에서 수정한 걸 막을 수 있고, 코드로 모든 변경이 추적됩니다.

## 기존 Terraform 프로젝트와의 손쉬운 통합

`Aztfexport` 로 생성한 .tf 파일은 기존에 사용 중이던 Terraform 프로젝트에 그대로 통합할 수 있습니다.
추가 리소스를 별도로 분리하거나 복잡하게 구성하지 않아도 됩니다.

예를 들어 이미 사용 중인 Terraform 코드가 있다면, 거기에 `Aztfexport` 로 가져온 리소스를 복사해서 붙여 넣기만 하면 됩니다.
기존 프로젝트와의 충돌 없이 자연스럽게 통합됩니다.

## 커뮤니티 기반의 생태계 지원

`Aztfexport` 는 Azure 커뮤니티 생태계의 일부로, 관련 문서와 예제, GitHub 저장소, 이슈 트래킹 등을 통해 활발하게 지원되고 있습니다.
다른 사용자들과의 협업 및 기여도 가능합니다.

이 도구는 개인 개발자가 만든 실험용 도구가 아니라, Microsoft 주도 + 오픈소스 커뮤니티에 의해 유지보수되는 정식 도구입니다.
관련 이슈가 생기면 GitHub 에서 질문하거나 다른 개발자들과 함께 문제를 해결할 수 있습니다.

# Aztfexport 사용 흐름 (workflow)

이제 Azure Export 도구가 Terraform 과 함께 어떻게 작동하는지, 그리고 리소스를 내보낼 때 어떤 절차(워크플로우)를 따르는지 살펴보겠습니다.

- 내보낼 기존 Azure 리소스를 식별합니다.
- 해당 리소스를 Terraform 상태 파일로 가져올지, 또는 HCL 코드로 생성할지 결정합니다.
- `Aztfexport` 를 설치하고 (설치 방법은 [링크][1]에서 확인), 내보낼 리소스를 지정하여 명령어를 실행합니다.
- 생성된 Terraform 코드를 확인하고, 필요한 경우 변수 추가, 모듈화, 사용자 정의 등을 적용합니다.
- 최종적으로 해당 코드를 기존 Terraform 프로젝트에 통합합니다. 상태에 등록되면 terraform plan, terraform apply 등의 명령으로 해당 리소스를 관리할 수 있습니다.

`Aztfexport` 는 내부적으로 [Aztft][1] 라는 또 다른 도구를 활용합니다.

`Aztft` 는 Azure 리소스 ID에 해당하는 Terraform AzureRM 리소스 타입을 판별해줍니다.
이 도구는 자동으로 [Terraform import][2] 를 실행하여 리소스를 상태 파일에 가져옵니다.

import 가 완료되면, Aztft 는 다시 Tfadd 라는 도구를 사용해 Terraform HCL 코드를 생성합니다.
[Tfadd][3] 는 Terraform 상태 파일을 분석하여 .tf 형식의 구성 코드를 생성해주는 Go 기반 도구 및 라이브러리입니다.

# Aztfexport 사용 방법

이 문서의 튜토리얼 섹션에서는, `Aztfexport` 를 설치하는 방법과, 이를 사용하여 기존 Azure 리소스를 Terraform 으로 내보내는 방법을 단계별로 설명합니다.

## 사전 준비 사항

- 기존 리소스를 포함한 Azure 구독이 있어야 합니다.
- aztfexport 를 사용하려면, 버전 0.12 이상인 Terraform 실행 파일이 $PATH 환경 변수에 등록되어 있어야 합니다.

## Azure Export for Terraform 설치하기

aztfexport 는 Windows, Linux, macOS, Ubuntu, Red Hat Linux, Go 툴체인 등 다양한 플랫폼에서 설치할 수 있습니다.

### Windows

Windows 에서 Azure Export (aztfexport)를 설치하려면, 다음 명령어를 실행하세요.

```shell
winget install aztfexport
```

![0043-01](/tech-blog/resources/images/translate/aztfexport/0043-01.png)

미리 컴파일된 바이너리 파일과 Windows 용 MSI 설치 프로그램은 GitHub [릴리스][4] 페이지에서도 제공됩니다.

### Linux / MacOS

Linux 또는 macOS 에서 aztfexport 를 설치하려면 다음 명령어를 실행하세요.

```shell
brew install aztfexport
``` 

### Ubuntu 20.04 or 22.04

Ubuntu 에서 Azure Export (aztfexport)를 설치하는 과정은 다음과 같습니다.

```shell
#Import the Microsoft repository key:

curl -sSL https://packages.microsoft.com/keys/microsoft.asc > /etc/apt/trusted.gpg.d/microsoft.asc

#Add packages-microsoft-com-prod repository:

ver=20.04 # or 22.04
apt-add-repository https://packages.microsoft.com/ubuntu/${ver}/prod

#Install:

apt-get install aztfexport
```

### Red Hat Linux 8 or 9

Red Hat Linux 8 또는 9에서 aztfexport 를 설치하려면, 아래 과정을 따르세요.

```shell
#Import the Microsoft repository key:

rpm --import https://packages.microsoft.com/keys/microsoft.asc

#Add packages-microsoft-com-prod repository:

ver=8 # or 9
dnf install -y https://packages.microsoft.com/config/rhel/${ver}/packages-microsoft-prod.rpm

#Install:

dnf install aztfexport
```

### Go Toolchain

다음 명령어는 Go를 이용하여 Azure Export for Terraform (aztfexport)를 설치합니다.

```shell
go install github.com/Azure/aztfexport@latest
```

## Azure 리소스 생성하기

이 예제에서는 다음과 같은 리소스를 생성합니다.

- 리소스 그룹: my-rg-test01
- 가상 네트워크(Virtual Network): my-vnet-test01
- 서브넷(Subnet): default, my-subnet-test01

이를 위해 Azure Portal에 접속하여, 상단 검색창에서 “Virtual networks”를 검색하고,
“가상 네트워크 만들기(Create virtual network)” 버튼을 클릭합니다.

그 다음, 다음 설정을 입력합니다.

- 새 리소스 그룹: my-rg-test01
- 가상 네트워크 이름: my-vnet-test01
- 지역(Region): (Europe) UK South

![0043-02](/tech-blog/resources/images/translate/aztfexport/0043-02.png)

다음을 클릭한 후, “IP 주소” 탭에서 다음과 같이 설정하세요.

- 주소 공간(Address space): 10.0.0.0/16 (기본값)
- 서브넷 1: 이름 – default, 주소 범위 – 10.0.1.0/24
- 서브넷 2: 이름 – my-subnet-test01, 주소 범위 – 10.0.2.0/24

![0043-03](/tech-blog/resources/images/translate/aztfexport/0043-03.png)

\[검토 + 만들기]를 누른 후, 마지막으로 \[만들기] 버튼을 클릭하세요.

## Azure 리소스를 내보내기 (Export)

아래는 aztfexport 명령어의 기본 문법입니다.

```shell
aztfexport [command] [option] <scope>
```

이 명령어에는 세 가지 옵션이 있습니다.

- resource
- resource-group
- query

어떤 리소스를 내보내고자 하느냐에 따라 이들 중 하나를 선택할 수 있습니다.
참고로 resource-group 옵션은 해당 리소스 그룹 내부의 모든 하위 리소스(nested contents)까지 함께 내보냅니다.

```shell
aztfexport resource-group my-rg-test01
```

위 명령어를 실행하면, aztfexport 가 초기화되며 내보낼 리소스 목록을 표시합니다.

또한, 아래와 같은 Azure Graph 쿼리를 사용하여 네트워크 리소스만 선택적으로 내보내는 것도 가능합니다.

```shell
aztfexport query -n "resourceGroup =~ 'my-rg-test01' and type contains 'Microsoft.Network'"
```

## 결과 확인하기

내보낸 Azure 리소스들은 Terraform 코드로 변환됩니다. 이제 인프라를 성공적으로 Terraform 으로 가져왔습니다!

생성된 파일에는 파일 이름 충돌을 방지하기 위해 .aztfexport 접미사가 붙어 있을 것입니다.
예: main.aztfexport.tf

이제 생성된 Terraform 코드를 확인하고 필요한 수정 사항을 적용해 봅시다.
그리고 내보낸 VNet 리소스를 기존 Terraform 프로젝트에 통합합니다.

최종 코드는 다음과 비슷한 형태가 됩니다.

```hcl
provider "azurerm" {
  features {}
}

resource "azurerm_virtual_network" "my_vnet" {
  name                = "my-vnet-test01"
  address_space = ["10.0.0.0/16"]
  location            = "UK South"
  resource_group_name = "my-rg-test01"

  subnet {
    name           = "default"
    address_prefix = "10.0.1.0/24"
  }

  subnet {
    name           = "my-subnet-test01"
    address_prefix = "10.0.2.0/24"
  }
}
```

## 정리하기

예기치 않은 비용 발생을 방지하려면, Azure 포털에서 생성한 테스트 리소스를 꼭 삭제하세요.

# Azure Terraform Export 의 한계점

Azure Terraform Export 도구에는 몇 가지 제약 사항이 있습니다.

예를 들어

- aztfexport 가 생성하는 Terraform 구성은 완전한 형태를 보장하지 않으며, 해당 구성만으로 전체 인프라를 100% 재현할 수 있는 것은 아닙니다.
- 이 도구는 오직 Azure 리소스에만 사용할 수 있습니다.
- 현재 aztfexport 는 명시적 의존성(explicit dependency)만 정의할 수 있습니다. 따라서, 리소스 간의 관계를 사용자가 직접 파악하고, 필요한 암묵적 의존성(implicit dependency)을 수동으로 코드에 반영해야 합니다.

# 핵심 요점 정리

aztfexport 는 기존 Azure 리소스를 Terraform 으로 가져오는 과정을 단순화하기 위해 만들어졌습니다.
리소스를 자동으로 코드로 변환하고, Terraform 상태(state)로 가져와 관리할 수 있도록 도와줍니다.

또한 [Spacelift][5] 를 함께 활용해보시길 권장합니다.
Terraform 인프라를 관리하거나, Terraform 및 기타 IaC(Infrastructure as Code) 도구 기반의 복잡한 워크플로우를 구성해야 할 경우, Spacelift 는 매우 유용한 도구입니다.
Spacelift 는 다음과 같은 기능을 기본으로 지원합니다

- Git 기반 워크플로우
- 정책 기반 코드 제어 (Policy as Code)
- 코드형 구성 (Programmatic Configuration)
- 컨텍스트 공유
- 드리프트(구성 불일치) 감지
- 기타 다양한 협업 및 자동화 기능

Spacelift 와 Azure 를 연동하는 방법이 궁금하다면, [공식 문서][6]를 참고하거나 [엔지니어와의 데모를 신청][7]해 보세요.

## Terraform 라이선스 관련 참고사항

Terraform 1.5 버전 이후는 BUSL (Business Source License) 로 변경되어, 완전한 오픈소스가 아닙니다.
하지만 1.5.x 이전 버전까지는 오픈소스로 유지됩니다.
이에 따라 [OpenTofu][8] 라는 프로젝트가 등장했습니다.
이는 Terraform 1.5.6에서 포크(fork)된 완전 오픈소스 대안 도구이며, 기존 Terraform 개념을 확장하여 제공합니다.

# 출처

- https://spacelift.io/blog/azure-terraform-export?utm_source=chatgpt.com

[1]:https://github.com/magodo/aztft

[2]:https://spacelift.io/blog/importing-exisiting-infrastructure-into-terraform

[3]:https://github.com/magodo/tfadd

[4]:https://github.com/Azure/aztfexport

[5]:https://docs.spacelift.io/

[6]:https://docs.spacelift.io/integrations/cloud-providers/azure

[7]:https://spacelift.io/schedule-demo

[8]:https://opentofu.org/
