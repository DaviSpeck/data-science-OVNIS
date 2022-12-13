# -*- coding: utf-8 -*-
"""Sprint_I.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1XcIT2ZX2IqLlbIWIFesBxcFksJ0JGpOQ
"""

!pip install pandasql

"""#### Realizando todos os imports e fazendo a requisição, confirmando sucesso da requisição com o status_code retornado.


"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import numpy as np
from pandas import DataFrame, Series
from datetime import datetime
import pandasql

# Requisitando dados da página de eventos por data
r = requests.get('https://nuforc.org/webreports/ndxevent.html')
r.status_code

"""#### Testando algumas funcionalidades da biblioteca "requests"."""

r.encoding

r.text

"""#### Pegando o texto da requisição e formatando conforme HTML através da biblioteca "BeautifulSoup"."""

# Transforma o documento em um objeto "BeautifulSoup" que 'encapsula
soup = BeautifulSoup(r.text, 'html.parser')

"""#### Testando função find_all para montagem de vetores do dataFrame."""

soup.find_all('a')

"""#### Montando vetores que serão passados como parâmetros para criação do dataframe e posteriormente do arquivo .csv, constando nestes a filtragem solicitada na etapa 1.1 (09/1997 -> 08/2017).

"""

data = []

for index, link in enumerate(soup.find_all('a')):
    if index != 0 and link.text != 'UNSPECIFIED / APPROXIMATE':
      aux = datetime.strptime(link.text, '%m/%Y').strftime('%m/%Y')
      data.append(aux)

contagem = []

for index, link in enumerate(soup.find_all('td')):
    if (index % 2 != 0) and link.text != '376':
      contagem.append(int(link.text))

links = []

for index, link in enumerate(soup.find_all('a')):
    if index != 0 and link.get('href') != 'ndxe.html':
      links.append(str('https://nuforc.org/webreports/' + link.get('href')))

"""#### Função de criação do dataframe "geral" a partir dos vetores criados anteriormente."""

def create_dataframe(data, contagem, links): 
  d = {
    "Data": data,
    "Contagem": contagem,
    "Links": links
  }

  df = DataFrame(d)

  return df

"""#### Criando dataframe utilizando a função e passando o mesmo como parâmetro para criação do .csv."""

df = create_dataframe(data, contagem, links)
df.to_csv("ovnis.csv", index = False)

df

"""#### Nesta parte, a partir do arquivo "ovnis.csv" foi montado um outro: "dados-filtrados.csv", constando neste o intervalo de datas solicitado (para essa parte, foi utilizada a linguagem JavaScript). Além disso, foi feito um array constando tabelas vindas do redirecionamento da coluna "Links" no dataFrame filtrado (dados-filtrados.csv)."""

df = pd.read_csv('./dados-filtrados.csv')
array = df.values.tolist()

tabelas = []

for val in array:
    tabelas.append(pd.read_html(val[2]))

len(tabelas)

"""#### Aqui foi montado um array para dinamizar o acesso às diversas tabelas e preparar os dados para estudo com consultas SQL."""

frames = []

for val in tabelas:
  frames.append(val[0])
  
frames_concatenados = pd.concat(frames)

frames_concatenados.to_csv('todos_ovnis.csv', sep=',')

"""#### Realizando consultas solicitadas na etapa 1.2 do projeto."""

# Saber a quantidade de linhas, observações ou variáveis que foram coletadas.
# RESPOSTA: 100398	

q1 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT * FROM q1;
"""

pandasql.sqldf(q, locals())

# Quantos relatos ocorreram por estado em ordem decrescente?

q2 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT COUNT(state), state FROM q2 GROUP BY state HAVING COUNT(state) > 1 ORDER BY count(state) DESC; 
"""

pandasql.sqldf(q, locals())

# Remover possíveis campos vazios (sem estado).
# RESPOSTA: 7242

q3 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT * FROM q3 WHERE state is null OR state = "";
"""

pandasql.sqldf(q, locals())

# Limitar a análise aos estados dos Estados Unidos.

q4 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT * FROM q4 WHERE Country = "USA"; 
"""

pandasql.sqldf(q, locals()).head()

# Consulta por cidades, com o objetivo de saber quais contêm o maior número de relatos (cidades que apresentem ao menos 10 relatos).

q5 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT COUNT(city), city FROM q5 GROUP BY city HAVING COUNT(city) > 10 ORDER BY count(city) DESC; 
"""

pandasql.sqldf(q, locals())

# Fazer uma query exclusiva para o estado com maior número de relatos, buscando cidades que possuam um número superior a 10 relatórios. Enfatizar a cidade, a quantidade de relatos e formato do objeto não identificado.
# Primeiro descobrindo estado com maior número de relatos (CA)

q7_1 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT COUNT(state), state FROM q7_1 GROUP BY state ORDER BY COUNT(state) DESC;
"""

pandasql.sqldf(q, locals())

# Fazer uma query exclusiva para o estado com maior número de relatos, buscando cidades que possuam um número superior a 10 relatórios. Enfatizar a cidade, a quantidade de relatos e formato do objeto não identificado.
# Agora fazendo a query baseado no estado com maior número de relatos

q7_2 = pd.read_csv('todos_ovnis.csv')

q = """
SELECT COUNT(city) AS "Number of Reports", state, city, shape FROM q7_2 WHERE state = "CA" GROUP BY city HAVING COUNT(city)> 10 ORDER BY COUNT(city) DESC;
"""

pandasql.sqldf(q, locals())