<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:mets="http://www.loc.gov/METS/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd"
  exclude-result-prefixes="mets xsi">

<xsl:output method="text"/>

    <!-- walk through entire document and do something with each -->
    <xsl:template match="@*|node()">
        <xsl:apply-templates select="@*|node()">
            <xsl:with-param name="parent_id">#</xsl:with-param>     
        </xsl:apply-templates>            
    </xsl:template>
    
    <xsl:template match="mets:div[@TYPE='page']"> 
        <xsl:param name="parent_id" />
        <xsl:variable name="this_id" select="generate-id(.)"/>
        <xsl:variable name="FILEID" select="./mets:fptr/@FILEID" />
{ "id" : "<xsl:value-of select="$this_id" />", "parent" : "<xsl:value-of select="$parent_id" />", "icon": "jstree-file", "text" : "<xsl:value-of select = "@LABEL"/>", "FILEID" : "<xsl:value-of select = "$FILEID" />" },
<!-- Page: "<xsl:value-of select = "@LABEL"/>" (id="<xsl:value-of select="$this_id" />" / parent="<xsl:value-of select="$parent_id" />") -->
    </xsl:template>
    
    <xsl:template match="mets:div[@TYPE = 'section']">
        <!-- because XSL is stupid, the inner code has to appear in both blocks
          of code, but only the top two condition need to be wrapped in an <ul>
          element, but there is no way to make valid xsl file -->
        <xsl:param name="parent_id" />
        <xsl:variable name="this_id" select="generate-id(.)"/>
        <xsl:choose>
            <xsl:when test="../../mets:div[@TYPE = 'volume']">
{ "id" : "<xsl:value-of select="$this_id" />", "parent" : "<xsl:value-of select="$parent_id" />", "state": {"opened":true}, "text" : "<xsl:value-of select = "@LABEL"/>" },
<!--                Section: "<xsl:value-of select = "@LABEL"/>" (id="<xsl:value-of select="$this_id" />" / parent="<xsl:value-of select="$parent_id" />") -->
                <xsl:apply-templates select="mets:div">
                  <xsl:with-param name="parent_id"><xsl:value-of select="$this_id"/></xsl:with-param>     
                </xsl:apply-templates>
            </xsl:when>            
            <xsl:when test="../mets:div[@TYPE = 'section']">
{ "id" : "<xsl:value-of select="$this_id" />", "parent" : "<xsl:value-of select="$parent_id" />", "state": {"opened":true}, "text" : "<xsl:value-of select = "@LABEL"/>" },
<!--                Subsection: "<xsl:value-of select = "@LABEL"/>" (id="<xsl:value-of select='$this_id'/>" / parent="<xsl:value-of select="$parent_id" />") -->
               <xsl:apply-templates select="mets:div">
                  <xsl:with-param name="parent_id"><xsl:value-of select="$this_id"/></xsl:with-param>     
                </xsl:apply-templates>
          </xsl:when>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>
