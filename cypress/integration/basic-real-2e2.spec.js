describe('end 2 end happy path using real data', () => {
  it('checks we show suggestions which can be selected', () => {
    cy.visit('index.html')
    cy.get(".knocode-suggestion-list").should("not.be.visible")
    cy.get("#line_1").click().type('PR8 2BS')
    cy.get(".knocode-suggestion-list").should("be.visible")
    cy.get("#postcode").should("be.empty")
    const li = cy.get(".knocode-suggestion-list").children().first()
    li.should("contain.text", "1 PALATINE ROAD, SOUTHPORT, MERSEYSIDE, PR8 2BS")
    li.click()
    cy.get("#postcode").should("contain.value", "PR8 2BS")
  })
})